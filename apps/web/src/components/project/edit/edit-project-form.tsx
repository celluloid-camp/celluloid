"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
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
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AutoCompleteTags } from "@/components/common/auto-complete-tags";
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
      <Box padding={2} sx={{ flexGrow: 1 }}>
        <TextField
          id="title"
          label={t("project.title")}
          fullWidth
          autoFocus
          autoComplete="none"
          spellCheck={false}
          margin="normal"
          inputProps={{
            "data-testid": "title",
          }}
          {...register("title")}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          disabled={isSubmitting || mutation.isPending}
        />
        <TextField
          id="description"
          label={t("project.description")}
          multiline
          rows={3}
          fullWidth
          autoComplete="none"
          inputProps={{
            "data-testid": "description",
          }}
          spellCheck={false}
          margin="normal"
          {...register("description")}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          disabled={isSubmitting || mutation.isPending}
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
            inputProps: {
              "data-testid": "keywords",
            },
            label: t("project.keywords"),
          }}
          limitTags={10}
        />

        <Typography
          variant="h6"
          sx={{
            pt: 1,
          }}
          gutterBottom={true}
        >
          {t("project.visibilitySection")}
        </Typography>

        <Box sx={{ maxWidth: "50%", ml: 2, pt: 2 }}>
          <FormGroup sx={{ mb: 1 }}>
            <FormControlLabel
              sx={{ fontSize: 10 }}
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

          <FormGroup sx={{ mb: 1 }}>
            <FormControlLabel
              sx={{ fontSize: 10 }}
              control={
                <Switch
                  checked={watch("collaborative")}
                  size="small"
                  data-testid="collaborative-switch"
                  onChange={(_, value) => {
                    setValue("collaborative", value, { shouldValidate: true });
                  }}
                />
              }
              label={t("project.collaborative")}
            />
            <FormHelperText>{t("project.collaborativeHelper")}</FormHelperText>
          </FormGroup>

          <FormGroup sx={{ mb: 1 }}>
            <FormControlLabel
              sx={{ fontSize: 10 }}
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
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
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

          <Grid display={"flex"} justifyContent={"flex-end"} size={8}>
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
      </Box>
    </form>
  );
}
