export type S3ObjectModel = {
  key: string;
  size: number;
  last_modified?: string;
  storage_class?: string;
};

export type S3SearchRequest = {
  s3Uri: string;
  contains?: string;
  limit?: number;
  suffixes?: string[];
  minSize?: number;
  maxSize?: number;
  storageClasses?: string[];
  modifiedAfter?: string;
  modifiedBefore?: string;
  sort_by?: "Key" | "Size" | "LastModified";
  sort_direction?: "asc" | "desc";
};

export type S3FolderModel = {
  path: string;
  name: string;
  depth: number;
  matched_count: number;
};

export type S3BreadcrumbModel = {
  path: string;
  name: string;
};

export type S3FolderChildrenResponse = {
  path: string;
  breadcrumbs: S3FolderChildrenResponse[];
  children: S3FolderModel[];
};

export type S3FolderSearchRequest = {
  s3Uri: string;
  contains?: string;
  limit?: number;
};

export type S3FolderChildrenRequest = {
  s3Uri: string;
  path?: string;
  contains?: string;
  limit?: number;
};
