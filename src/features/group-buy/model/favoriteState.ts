import { useEffect, useState } from "react";

type FavoriteListener = (isFavorite: boolean) => void;
type FavoriteChangeListener = (postId: string, isFavorite: boolean) => void;

const favoriteStates = new Map<string, boolean>();
const listeners = new Map<string, Set<FavoriteListener>>();
const changeListeners = new Map<string, Set<FavoriteChangeListener>>();

function getKey(postId: string | number, userId = "") {
  return `${userId}:${String(postId)}`;
}

export function getFavoriteState(postId: string | number, userId = "") {
  return favoriteStates.get(getKey(postId, userId));
}

export function setFavoriteState(postId: string | number, isFavorite: boolean, userId = "") {
  const key = getKey(postId, userId);
  favoriteStates.set(key, isFavorite);
  listeners.get(key)?.forEach((listener) => listener(isFavorite));
  changeListeners.get(userId)?.forEach((listener) => listener(String(postId), isFavorite));
}

export function subscribeFavoriteChanges(userId: string, listener: FavoriteChangeListener) {
  const userListeners = changeListeners.get(userId) ?? new Set<FavoriteChangeListener>();
  userListeners.add(listener);
  changeListeners.set(userId, userListeners);

  return () => {
    const currentListeners = changeListeners.get(userId);
    currentListeners?.delete(listener);
    if (currentListeners?.size === 0) changeListeners.delete(userId);
  };
}

export function subscribeFavoriteState(postId: string | number, userId: string, listener: FavoriteListener) {
  const key = getKey(postId, userId);
  const postListeners = listeners.get(key) ?? new Set<FavoriteListener>();
  postListeners.add(listener);
  listeners.set(key, postListeners);

  return () => {
    const currentListeners = listeners.get(key);
    currentListeners?.delete(listener);
    if (currentListeners?.size === 0) listeners.delete(key);
  };
}

export function useFavoriteState(postId: string | number, initialValue: boolean, userId: string) {
  const [isFavorite, setIsFavorite] = useState(() => getFavoriteState(postId, userId) ?? initialValue);

  useEffect(() => {
    const storedValue = getFavoriteState(postId, userId);
    setIsFavorite(storedValue ?? initialValue);
    return subscribeFavoriteState(postId, userId, setIsFavorite);
  }, [postId, initialValue, userId]);

  return isFavorite;
}

export function clearFavoriteStatesForTest() {
  favoriteStates.clear();
  listeners.clear();
  changeListeners.clear();
}
