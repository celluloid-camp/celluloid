import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTRPC } from "@/lib/trpc/client";
import SettingsTabPanel from "./settings-tab-panel";
import UploadAvatar from "./upload-avatar";

export default function EditProfileTabForm({
  value,
  index,
}: {
  value: number;
  index: number;
}) {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const mutation = useMutation(api.user.update.mutationOptions());
  const { enqueueSnackbar } = useSnackbar();

  const { data: user } = useSuspenseQuery(api.user.me.queryOptions());

  const editProfileSchema = z.object({
    username: z.string().min(1, t("profile.update.username")),
    firstname: z.string().nullable(),
    lastname: z.string().nullable(),
    bio: z.string().nullable(),
    avatarStorageId: z.string().nullable(),
  });

  type EditProfileFormValues = z.infer<typeof editProfileSchema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user?.username ?? "",
      firstname: user?.firstname ?? "",
      lastname: user?.lastname ?? "",
      bio: user?.bio ?? "",
      avatarStorageId: user?.avatarStorageId ?? null,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    reset({
      username: user?.username ?? "",
      firstname: user?.firstname ?? "",
      lastname: user?.lastname ?? "",
      bio: user?.bio ?? "",
      avatarStorageId: user?.avatarStorageId ?? null,
    });
  }, [user, reset]);

  const onSubmit = async (values: EditProfileFormValues) => {
    clearErrors("root.serverError");
    try {
      await mutation.mutateAsync({
        username: values.username,
        firstname: values.firstname,
        lastname: values.lastname,
        bio: values.bio,
        avatarStorageId: values.avatarStorageId,
      });

      queryClient.invalidateQueries(api.user.me.queryFilter());
      enqueueSnackbar(t("profile.update.success"), {
        variant: "success",
        key: "user.update.success",
      });
    } catch (e) {
      setError("root.serverError", {
        type: "server",
        message:
          e instanceof Error
            ? e.message
            : t("profile.update.username-already-used"),
      });
    }
  };
  return (
    <SettingsTabPanel value={value} index={index}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5">{t("profile.update.title")}</Typography>
        {errors.root?.serverError?.message ? (
          <Alert severity="error" sx={{ borderRadius: 0, mt: 0 }}>
            {errors.root.serverError.message}
          </Alert>
        ) : null}
        <Box
          sx={{
            width: "50%",
            justifyContent: "flex-start",
            alignContent: "flex-start",
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            py: 2,
          }}
        >
          <UploadAvatar
            storageId={watch("avatarStorageId") ?? null}
            color={user?.color ?? ""}
            initial={user?.initial ?? ""}
            url={user?.image ?? ""}
            onChange={(id) => {
              setValue("avatarStorageId", id, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={user?.email}
            disabled
          />
          <TextField
            id="username"
            {...register("username")}
            placeholder={t("profile.update.username")}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                "data-testid": "username",
              },
            }}
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            label={t("profile.update.username")}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            id="firstname"
            {...register("firstname")}
            placeholder={t("profile.update.firstname")}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                "data-testid": "firstname",
              },
            }}
            error={Boolean(errors.firstname)}
            helperText={errors.firstname?.message}
            label={t("profile.update.firstname")}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            id="lastname"
            {...register("lastname")}
            placeholder={t("profile.update.lastname")}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                "data-testid": "lastname",
              },
            }}
            error={Boolean(errors.lastname)}
            helperText={errors.lastname?.message}
            label={t("profile.update.lastname")}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            id="bio"
            {...register("bio")}
            placeholder={t("profile.update.bio")}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                "data-testid": "bio",
              },
            }}
            error={Boolean(errors.bio)}
            helperText={errors.bio?.message}
            label={t("profile.update.bio")}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </Box>

        <Button
          variant="contained"
          size="medium"
          color="primary"
          type="submit"
          data-testid="submit"
          loading={mutation.isPending}
          sx={{ textTransform: "uppercase" }}
        >
          {t("profile.update.submit")}
        </Button>
      </form>
    </SettingsTabPanel>
  );
}
