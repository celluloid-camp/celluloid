import { UserRecord } from '@celluloid/types';
import {
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import UserAvatar from 'components/UserAvatar';
import * as React from 'react';
import { withI18n, WithI18n } from 'react-i18next';

interface Props {
  user?: UserRecord;
  menuAnchor?: HTMLElement;
  onClickLogin(): void;
  onClickSignup(): void;
  onClickLogout(): void;
  onOpenUserMenu(element: EventTarget): void;
  onCloseUserMenu(): void;
}

export default withI18n()(({
  user,
  menuAnchor,
  onClickLogin,
  onClickSignup,
  onClickLogout,
  onOpenUserMenu,
  onCloseUserMenu,
  t
}: Props & WithI18n) =>
  user ? (
    <div>
      <IconButton
        onClick={event => onOpenUserMenu(event.target)}
      >
        <UserAvatar user={user} noMargin={true} />
      </IconButton>
      <Popper
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        transition={true}
        disablePortal={true}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={onCloseUserMenu}>
                <MenuList>
                  <MenuItem onClick={onClickLogout}>Déconnexion</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  ) : (
      <div>
        <Button
          onClick={onClickSignup}
        >
          {t('menu.signup')}
        </Button>
        <Button
          onClick={onClickLogin}
          color="primary"
        >
          {t('menu.login')}
        </Button>
      </div>
    )
);