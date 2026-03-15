import { Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type React from "react";
import { useState } from "react";
import { Avatar } from "@/components/common/avatar";
import { useTRPC } from "@/lib/trpc/client";
import { trpcClient } from "@/lib/trpc/provider";

const Input = styled("input")({
  display: "none",
});

type UploadAvatarProps = {
  storageId: string | null;
  color: string;
  initial: string;
  url?: string;
  onChange: (fileId: string | null) => void;
};
export default function UploadAvatar({
  storageId,
  color,
  initial,
  url,
  onChange,
}: UploadAvatarProps) {
  const [avatar, setAvatar] = useState<string | undefined>(url ?? "");
  const api = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();
  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
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
          await trpcClient.storage.presignedUrl.mutate({
            name: file.name,
          });

        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });
        const { id, publicUrl } = await trpcClient.storage.add.mutate({
          path: path,
        });

        setAvatar(publicUrl);

        onChange(id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDelete = async () => {
    if (storageId) {
      try {
        await trpcClient.storage.delete.mutate({
          storageId: storageId,
        });

        enqueueSnackbar(t("profil.update.avatar.success"), {
          variant: "success",
          key: "profil.update.avatar.success",
        });
        setAvatar(undefined);
        onChange(null);
      } catch (e) {
        enqueueSnackbar(t("profil.update.avatar.error"), {
          variant: "error",
          key: "profil.update.avatar.error",
        });
      }
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        alt="User Avatar"
        sx={{
          background: color,
          borderColor: color,
          borderStyle: "solid",
        }}
        className="w-20 h-20 border-2 border-color-color text-2xl"
        src={avatar}
      >
        {initial}
      </Avatar>

      <Button color="primary" component="label" variant="outlined" size="small">
        {t("profile.update.upload-avatar")}
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
          {t("profile.update.delete-avatar")}
        </Button>
      ) : null}
    </Stack>
  );
}
