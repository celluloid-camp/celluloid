import * as React from 'react';
import { NavLink } from 'react-router-dom';

// tslint:disable-next-line:no-any
export const getButtonLink = (to: string) => (buttonProps: any) =>
  <NavLink to={to} {...buttonProps} />;