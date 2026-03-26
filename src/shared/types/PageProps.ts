export interface PageProps<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página actual (0-based)
  first: boolean;
  last: boolean;
}
