"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SyncIcon from "@mui/icons-material/Sync";
import {
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Switch,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AutoCompleteTags } from "@/components/common/auto-complete-tags";
import { Image } from "@/components/common/image";
import { useHumanizeError } from "@/i18n/errors";
import { useTRPC } from "@/lib/trpc/client";

export function EditProjectForm({ projectId }: { projectId: string }) {
  const t = useTranslations();
  const confirm = useConfirm();
  const api = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const humanizeError = useHumanizeError();
  const { enqueueSnackbar } = useSnackbar();

  const { data: project } = useSuspenseQuery(
    api.project.byId.queryOptions({ id: projectId }),
  );

  const deleteMutation = useMutation(
    api.project.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(api.project.list.queryFilter());
        router.push("/");
      },
      onError: (e) => {
        enqueueSnackbar(t("project.delete.error"), {
          variant: "error",
          key: "project.delete.error",
        });
      },
    }),
  );
  const handleDelete = () => {
    deleteMutation.mutate({
      projectId: project.id,
    });
  };

  const confirmDelete = () => {
    confirm({
      title: t("project.confirm-delete.title"),
      description: t("project.confirm-delete.description"),
      confirmationText: t("deleteAction"),
      cancellationText: t("cancelAction"),
      confirmationButtonProps: {
        variant: "contained",
        color: "error",
      },
    }).then((value) => {
      if (value.confirmed) {
        handleDelete();
      }
    });
  };

  const mutation = useMutation(
    api.project.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          api.project.byId.queryFilter({ id: project.id }),
        );
        enqueueSnackbar(t("project.edit.success"), {
          variant: "success",
          key: "project.edit.success",
        });
      },
      onError: (e) => {
        enqueueSnackbar(t("project.edit.error"), {
          variant: "error",
          key: "project.edit.error",
        });
      },
    }),
  );

  const syncThumbnailMutation = useMutation(
    api.project.sync.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          api.project.byId.queryFilter({ id: project.id }),
        );
        queryClient.invalidateQueries(api.project.list.queryFilter());
        enqueueSnackbar(t("project.edit.syncThumbnailSuccess"), {
          variant: "success",
          key: "project.edit.syncThumbnailSuccess",
        });
      },
      onError: (err) => {
        const isPassword =
          err instanceof TRPCClientError &&
          err.message === "video_requires_password";
        enqueueSnackbar(
          isPassword
            ? t("project.edit.syncThumbnailPassword")
            : t("project.edit.syncThumbnailError"),
          {
            variant: "error",
            key: "project.edit.syncThumbnailError",
          },
        );
      },
    }),
  );

  const editProjectSchema = z.object({
    title: z.string().min(5, "Le titre doit comporter au moins 5 caractères."),
    description: z.string().min(1, "La description est requise."),
    keywords: z.array(z.string()).optional(),
    public: z.boolean(),
    collaborative: z.boolean(),
    shared: z.boolean(),
  });
  type EditProjectFormValues = z.infer<typeof editProjectSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description,
      public: project.public,
      collaborative: project.collaborative,
      shared: project.shared,
      keywords: project.keywords ?? [],
    },
  });

  const onSubmit = async (values: EditProjectFormValues) => {
    try {
      await mutation.mutateAsync({
        projectId: project.id,
        title: values.title,
        description: values.description,
        public: values.public,
        collaborative: values.collaborative,
        shared: values.shared,
        keywords: values.keywords,
      });
      reset(values);
      router.back();
    } catch (e) {
      setError("title", { message: humanizeError("ERR_UNKOWN") });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:items-start md:gap-8">
        <div className="flex w-full max-w-full shrink-0 flex-col gap-2 self-center md:w-[280px] md:self-start">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-(--mui-palette-action-hover)">
            <Image
              key={project.thumbnailURL ?? "no-thumb"}
              src={project.thumbnailURL}
              alt={project.title}
              sizes="(max-width: 900px) 100vw, 280px"
              errorPlaceholder={
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-red-100 px-3 text-center">
                  <BrokenImageOutlinedIcon
                    className="text-5xl text-(--mui-palette-text-disabled)"
                    aria-hidden
                  />
                  <span className="text-xs text-(--mui-palette-text-secondary)">
                    {t("project.edit.thumbnailLoadError")}
                  </span>
                </div>
              }
            />
          </div>
          {project.editable ? (
            <Button
              type="button"
              size="small"
              variant="contained"
              color="inherit"
              className="w-full shadow-md md:self-end md:w-auto"
              data-testid="sync-thumbnail"
              loading={syncThumbnailMutation.isPending}
              startIcon={<SyncIcon />}
              onClick={() =>
                syncThumbnailMutation.mutate({ projectId: project.id })
              }
            >
              {t("project.edit.syncThumbnail")}
            </Button>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <TextField
            id="title"
            label={t("project.title")}
            fullWidth
            autoFocus
            autoComplete="none"
            spellCheck={false}
            margin="normal"
            {...register("title")}
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            disabled={isSubmitting || mutation.isPending}
            slotProps={{
              htmlInput: {
                "data-testid": "title",
              },
            }}
          />
          <TextField
            id="description"
            label={t("project.description")}
            multiline
            rows={3}
            fullWidth
            autoComplete="none"
            spellCheck={false}
            margin="normal"
            {...register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            disabled={isSubmitting || mutation.isPending}
            slotProps={{
              htmlInput: {
                "data-testid": "description",
              },
            }}
          />
          <AutoCompleteTags
            id="keywords"
            options={[""]}
            onChange={(_event, newValue) => {
              setValue("keywords", newValue, { shouldValidate: true });
            }}
            disabled={isSubmitting || mutation.isPending}
            value={watch("keywords") ?? []}
            textfieldprops={{
              margin: "normal",
              slotProps: {
                htmlInput: {
                  "data-testid": "keywords",
                },
              },
              label: t("project.keywords"),
            }}
            limitTags={10}
          />

          <Typography variant="h6" className="mb-2 pt-1">
            {t("project.visibilitySection")}
          </Typography>

          <div className="ml-4 max-w-[50%] pt-4">
            <FormGroup className="mb-2">
              <FormControlLabel
                className="text-[10px]"
                control={
                  <Switch
                    checked={watch("public")}
                    size="small"
                    data-testid="collaborative-switch"
                    onChange={(_, value) => {
                      setValue("public", value, { shouldValidate: true });
                    }}
                  />
                }
                label={t("project.public")}
              />
              <FormHelperText>{t("project.publicHelper")}</FormHelperText>
            </FormGroup>

            <FormGroup className="mb-2">
              <FormControlLabel
                className="text-[10px]"
                control={
                  <Switch
                    checked={watch("collaborative")}
                    size="small"
                    data-testid="collaborative-switch"
                    onChange={(_, value) => {
                      setValue("collaborative", value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                }
                label={t("project.collaborative")}
              />
              <FormHelperText>
                {t("project.collaborativeHelper")}
              </FormHelperText>
            </FormGroup>

            <FormGroup className="mb-2">
              <FormControlLabel
                className="text-[10px]"
                control={
                  <Switch
                    checked={watch("shared")}
                    size="small"
                    data-testid="shared-switch"
                    onChange={(_, value) => {
                      setValue("shared", value, { shouldValidate: true });
                    }}
                  />
                }
                label={t("project.shared")}
              />
              <FormHelperText>{t("project.shareHelper")}</FormHelperText>
            </FormGroup>
          </div>

          <Grid container spacing={2} className="mt-4">
            <Grid size={4}>
              {project.deletable && (
                <Button
                  variant="outlined"
                  color="error"
                  size="medium"
                  onClick={confirmDelete}
                  startIcon={<DeleteIcon />}
                >
                  {t("project.edit.delete.button")}
                </Button>
              )}
            </Grid>

            <Grid
              size={8}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                size="medium"
                data-testid="submit"
                color="primary"
                type="submit"
                loading={mutation.isPending}
                startIcon={<EditIcon />}
              >
                {t("project.edit.submit.button")}
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </form>
  );
}
