import { getAnalytics } from 'firebase/analytics';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  off,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  limitToFirst,
  startAt,
  endAt,
  equalTo,
  Database,
  DatabaseReference,
  DataSnapshot,
  Query,
  QueryConstraint
} from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState, useCallback, useRef } from 'react';
import { firebaseConfig } from './firebase/config';
import {app, firestore, database} from './firebase/config';

// Initialize Auth
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { database };

// Types
export interface FirebaseOptions {
  orderBy?: string;
  limit?: number;
  startAtValue?: string | number | boolean | null;
  endAtValue?: string | number | boolean | null;
  equalTo?: string | number | boolean | null;
  reverse?: boolean;
  transform?: (data: any[]) => any[];
}

// Custom hook to track current authenticated user
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}


//  * Email/Password Login
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

//  * Register new user with Email/Password
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};


//  * Google Sign-In (Popup)

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};


//  Logout
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Custom hook for real-time single value
export function useFirebaseValue<T>(path: string, defaultValue?: T): T | null {
  const [value, setValue] = useState<T | null>(defaultValue || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dataRef: DatabaseReference = ref(database, path);
    
    setLoading(true);
    setError(null);

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.val() as T;
        setValue(val);
        setLoading(false);
      },
      (error) => {
        console.error(`Error reading from Firebase path "${path}":`, error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return value;
}

// Custom hook for real-time list data
export function useFirebaseList<T = any>(
  path: string,
  options: FirebaseOptions = {}
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousPathRef = useRef<string>('');
  const previousOptionsRef = useRef<FirebaseOptions>({});

  useEffect(() => {
    // Skip if path is empty
    if (!path.trim()) {
      setData([]);
      setLoading(false);
      return;
    }

    // Check if anything changed
    const pathChanged = previousPathRef.current !== path;
    const optionsChanged = JSON.stringify(previousOptionsRef.current) !== JSON.stringify(options);
    
    if (!pathChanged && !optionsChanged && data.length > 0) {
      return; // Skip re-subscription if nothing changed
    }

    previousPathRef.current = path;
    previousOptionsRef.current = { ...options };

    let dataRef: DatabaseReference | Query = ref(database, path);
    const queryConstraints: QueryConstraint[] = [];

    // Apply query options
    if (options.orderBy) {
      if (options.orderBy === '$key') {
        queryConstraints.push(orderByKey());
      } else {
        queryConstraints.push(orderByChild(options.orderBy));
      }
    }

    if (options.equalTo !== undefined) {
      queryConstraints.push(equalTo(options.equalTo));
    }

    if (options.startAtValue !== undefined) {
      queryConstraints.push(startAt(options.startAtValue));
    }

    if (options.endAtValue !== undefined) {
      queryConstraints.push(endAt(options.endAtValue));
    }

    if (options.limit && options.limit > 0) {
      if (options.reverse) {
        queryConstraints.push(limitToFirst(options.limit));
      } else {
        queryConstraints.push(limitToLast(options.limit));
      }
    }

    // Apply all constraints if any exist
    if (queryConstraints.length > 0) {
      dataRef = query(dataRef, ...queryConstraints);
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onValue(
      dataRef,
      (snapshot: DataSnapshot) => {
        try {
          if (!snapshot.exists()) {
            setData([]);
            setLoading(false);
            return;
          }

          const result: T[] = [];
          
          snapshot.forEach((childSnapshot: DataSnapshot) => {
            const childData = childSnapshot.val();
            const item = {
              id: childSnapshot.key,
              ...childData,
            } as T;
            result.push(item);
          });

          // Apply reverse if needed
          let finalResult = options.reverse ? result.reverse() : result;
          
          // Apply custom transform if provided
          if (options.transform && typeof options.transform === 'function') {
            finalResult = options.transform(finalResult) as T[];
          }

          setData(finalResult);
          setLoading(false);
        } catch (err) {
          console.error('Error processing Firebase data:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (error: Error) => {
        console.error(`Error reading list from Firebase path "${path}":`, error);
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [path, JSON.stringify(options), data.length]); // Stringify options for deep comparison

  return { data, loading, error };
}

// Enhanced hook with pagination support - Simplified version
export function useFirebasePaginatedList<T = any>(
  path: string,
  pageSize: number = 10,
  orderBy: string = '$timestamp'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Skip if no path
    if (!path.trim()) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    let dataRef: DatabaseReference | Query = ref(database, path);
    const constraints: QueryConstraint[] = [
      orderByChild(orderBy),
      limitToLast(pageSize * (page + 1))
    ];
    
    dataRef = query(dataRef, ...constraints);

    const unsubscribe = onValue(
      dataRef,
      (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
          setData([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        const result: T[] = [];
        let keys: string[] = [];
        
        snapshot.forEach((childSnapshot: DataSnapshot) => {
          const childValue = childSnapshot.val();
          const childKey = childSnapshot.key!;
          let item: any;
          if (typeof childValue === 'object' && childValue !== null) {
            item = {
              id: childKey,
              ...childValue,
            };
          } else {
            item = {
              id: childKey,
              value: childValue,
              timestamp: parseInt(childKey, 10),
            };
          }
          result.push(item as T);
        });

        // Reverse to get chronological order (newest first)
        const reversed = result.reverse();
        
        // Check if there's more data
        setHasMore(result.length >= pageSize * (page + 1));
        setData(reversed);
        setLoading(false);
      },
      (error: Error) => {
        console.error('Error loading paginated data:', error);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [path, pageSize, orderBy, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return { data, loading, hasMore, loadMore, page };
}

// Hook for real-time updates with custom handler
export function useFirebaseRealtime<T>(
  path: string,
  onData: (data: T | null) => void,
  onError?: (error: Error) => void
) {
  useEffect(() => {
    const dataRef: DatabaseReference = ref(database, path);
    
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.exists() ? (snapshot.val() as T) : null;
        onData(data);
      },
      (error) => {
        console.error(`Error in real-time listener for path "${path}":`, error);
        if (onError) onError(error);
      }
    );

    return () => unsubscribe();
  }, [path, onData, onError]);
}

// Utility function to push data to Firebase
export async function pushToFirebase<T extends Record<string, any>>(
  path: string,
  data: T
): Promise<string | null> {
  try {
    const { push, set, getDatabase, ref } = await import('firebase/database');
    const dbInstance = getDatabase(app);
    const dbRef = ref(dbInstance, path);
    const newRef = push(dbRef);
    
    await set(newRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return newRef.key;
  } catch (error) {
    console.error('Error pushing to Firebase:', error);
    return null;
  }
}

// Utility function to update data
export async function updateFirebaseData(
  path: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const { update, ref } = await import('firebase/database');
    const dbRef = ref(database, path);
    
    await update(dbRef, {
      ...data,
      updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating Firebase data:', error);
    return false;
  }
}

// Utility function to delete data
export async function deleteFromFirebase(path: string): Promise<boolean> {
  try {
    const { remove, ref } = await import('firebase/database');
    const dbRef = ref(database, path);
    
    await remove(dbRef);
    return true;
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    return false;
  }
}

// Batch write operations
export async function batchWrite(
  updates: Record<string, any>
): Promise<boolean> {
  try {
    const { update, ref } = await import('firebase/database');
    const dbRef = ref(database, '/');
    
    await update(dbRef, updates);
    return true;
  } catch (error) {
    console.error('Error in batch write:', error);
    return false;
  }
}

// Helper function to format Firebase data
export function formatFirebaseData<T>(snapshot: DataSnapshot): T[] {
  const result: T[] = [];
  
  snapshot.forEach((childSnapshot: DataSnapshot) => {
    const childValue = childSnapshot.val();
    const childKey = childSnapshot.key!;
    let childData: any;
    if (typeof childValue === 'object' && childValue !== null) {
      childData = {
        id: childKey,
        ...childValue,
      };
    } else {
      childData = {
        id: childKey,
        value: childValue,
        timestamp: parseInt(childKey, 10),
      };
    }
    result.push(childData as T);
  });
  
  return result;
}

// Subscribe to value changes with custom parsing
export function subscribeToValue<T>(
  path: string,
  callback: (data: T | null) => void,
  parser?: (data: any) => T
) {
  const dataRef: DatabaseReference = ref(database, path);
  
  const unsubscribe = onValue(
    dataRef,
    (snapshot) => {
      const rawData = snapshot.exists() ? snapshot.val() : null;
      const data = parser && rawData ? parser(rawData) : (rawData as T);
      callback(data);
    },
    (error) => {
      console.error(`Error in subscription for path "${path}":`, error);
      callback(null);
    }
  );
  
  return unsubscribe;
}

// Enhanced useFirebaseValue with loading and error states
export function useFirebaseValueEnhanced<T>(
  path: string,
  defaultValue?: T
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(defaultValue || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dataRef: DatabaseReference = ref(database, path);
    
    setLoading(true);
    setError(null);

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.exists() ? (snapshot.val() as T) : defaultValue || null;
        setData(val);
        setLoading(false);
      },
      (error) => {
        console.error(`Error reading from Firebase path "${path}":`, error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, defaultValue]);

  return { data, loading, error };
}

// Export app instance if needed elsewhere
export { app };