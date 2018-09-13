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

interface Props {
  user?: UserRecord;
  menuAnchor?: HTMLElement;
  onClickLogin(): void;
  onClickSignup(): void;
  onClickLogout(): void;
  onClickAvatar(element: EventTarget): void;
  onCloseMenu(): void;
}

export default ({
  user,
  menuAnchor,
  onClickLogin,
  onClickSignup,
  onClickLogout,
  onClickAvatar,
  onCloseMenu
}: Props) =>
  user ? (
    <div>
      <IconButton
        onClick={event => onClickAvatar(event.target)}
      >
        <UserAvatar user={user} noMargin={true}/>
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
            <Paper style={{marginRight: 0, marginTop: 12}}>
              <ClickAwayListener onClickAway={onCloseMenu}>
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
          {`Inscription`}
        </Button>
        <Button
          onClick={onClickLogin}
          color="primary"
        >
          {`Connexion`}
        </Button>
      </div>
    );