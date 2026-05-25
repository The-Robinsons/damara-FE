export type HomeCategoryId = "all" | "food" | "daily" | "beauty" | "stationery";

export interface CategoryItem {
  id: HomeCategoryId;
  label: string;
}

export const HOME_CATEGORIES: CategoryItem[] = [
  { id: "all", label: "전체" },
  { id: "food", label: "먹거리" },
  { id: "daily", label: "생활용품" },
  { id: "beauty", label: "뷰티·패션" },
  { id: "stationery", label: "학용품" },
];
