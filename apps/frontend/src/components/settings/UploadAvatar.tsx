import { Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Avatar } from "~components/Avatar";
import { trpc } from "~utils/trpc";

const Input = styled("input")({
  display: "none",
});

type UploadAvatarProps = {
  color: string;
  initial: string;
  url?: string;
  onChance: (fileId: string | null) => void;
};
export default function UploadAvatar({
  color,
  initial,
  url,
  onChance,
}: UploadAvatarProps) {
  const [avatar, setAvatar] = useState<string>(url); // Replace with your default avatar
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      try {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);

        const { uploadUrl, path } =
          await utils.client.storage.presignedUrl.mutate({
            name: file.name,
          });

        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });
        const { id, publicUrl } = await utils.client.storage.add.mutate({
          path: path,
        });

        setAvatar(publicUrl);

        onChance(id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDelete = () => {
    setAvatar(null);
    onChance(null);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        alt="User Avatar"
        sx={{
          background: color,
          width: 100,
          height: 100,
          borderWidth: 2,
          borderColor: color,
          borderStyle: "solid",
        }}
        src={avatar}
      >
        {initial}
      </Avatar>

      <Button color="primary" component="label" variant="outlined" size="small">
        <Trans i18nKey="profile.edit.upload-avatar">Télécharger</Trans>
        <Input
          accept="image/*"
          id="upload-avatar"
          type="file"
          onChange={handleAvatarChange}
        />
      </Button>
      {avatar ? (
        <Button
          color="error"
          variant="outlined"
          onClick={handleDelete}
          size="small"
        >
          <Trans i18nKey="profile.edit.delete-avatar">Supprimer</Trans>
        </Button>
      ) : null}
    </Stack>
  );
}
