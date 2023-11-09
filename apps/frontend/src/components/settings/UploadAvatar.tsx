import { Avatar, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

const Input = styled('input')({
  display: 'none',
});

export default function UploadAvatar() {
  const [avatar, setAvatar] = useState<string>('/static/images/avatar/1.jpg'); // Replace with your default avatar
  const [hover, setHover] = useState<boolean>(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      <Avatar
        alt="User Avatar"
        src={avatar}
        sx={{ width: 128, height: 128 }}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        {hover && (
          <Button
            color="primary"
            component="label"
            onMouseOver={() => setHover(true)}
          >
            Upload
            <Input
              accept="image/*"
              id="upload-avatar"
              type="file"
              onChange={handleAvatarChange}
            />
          </Button>
        )}
      </Avatar>
    </Stack>
  );
}
