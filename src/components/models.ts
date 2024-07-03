import { AxiosRequestConfig } from 'axios';

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface InsStateOption {
  _id: string;
  label: string;
  value: string;
}

export interface Account {
  username: string;
  password: string;
}

export interface Payload {
  [key: string]: any;
}
