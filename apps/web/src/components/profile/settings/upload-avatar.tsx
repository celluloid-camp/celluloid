import { Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { trpc } from "@/lib/trpc/client";
import { useTranslations } from "next-intl";

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
  const [avatar, setAvatar] = useState<string>(url ?? ""); // Replace with your default avatar
  const utils = trpc.useUtils();
  const t = useTranslations();

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
        {t("profile.edit.upload-avatar")}
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
          {t("profile.edit.delete-avatar")}
        </Button>
      ) : null}
    </Stack>
  );
}
