
import { Action as ReduxAction } from 'redux';

export interface Action<T> extends ReduxAction {
  type: string;
  payload?: T;
  error?: boolean;
}