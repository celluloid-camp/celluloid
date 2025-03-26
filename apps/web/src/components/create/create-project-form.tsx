"use client";

import { LoadingButton } from "@mui/lab";
import { Box, Grid, Switch, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";

import type React from "react";
import { useState } from "react";

import * as Yup from "yup";
import { useSession } from "@/lib/auth-client";

import { AutoCompleteTags } from "@/components/common/auto-complete-tags";
import type { PeerTubeVideoDataResult } from "@/services/peertube";
import { ERR_ALREADY_EXISTING_PROJECT } from "@/i18n/errors";
import { useHumanizeError } from "@/i18n/errors";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function CreateProjectForm({ data }: { data: PeerTubeVideoDataResult }) {
  const t = useTranslations();
  const router = useRouter();

  const humanizeError = useHumanizeError();
  const { data: session } = useSession();

  const playlistMutation = trpc.playlist.add.useMutation();
  const projectMutation = trpc.project.add.useMutation();

  // const [initialValue, setInitialValue] = useProjectInputIntialState();
  // const resetSavedValue = userResetProjectInputIntialState;

  // const mutation = useMutation({
  //   mutationFn: (newProject: ProjectCreateData) => {
  //     return Projects.create(newProject);
  //   },
  // });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(5, "Le titre doit comporter au moins 5 caractères.")
      .required("Le titre est requis."),
    description: Yup.string().required("La description est requise."),
    keywords: Yup.array().of(Yup.string()),
    public: Yup.bool(),
    collaborative: Yup.bool(),
    videoInfo: Yup.object().required(),
    shared: Yup.bool(),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      keywords: [],
      public: false,
      collaborative: false,
      shared: false,
      videoInfo: data,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      if (!session) {
        router.push("/login");
      } else {
        try {
          if (!data.isPlaylist) {
            const video = values.videoInfo?.videos[0];
            const project = await projectMutation.mutateAsync({
              title: values.title,
              videoId: video.shortUUID,
              host: video.account.host,
              description: values.description,
              public: values.public,
              collaborative: values.collaborative,
              duration: video.duration,
              thumbnailURL: video.thumbnailURL,
              metadata: video.metadata,
              keywords: values.keywords,
              objective: "",
              levelStart: 0,
              levelEnd: 5,
              shared: values.shared,
            });
            if (project) {
              formik.resetForm();
              router.push(`/project/${project.id}`);
            }
          } else {
            const playlist = await playlistMutation.mutateAsync({
              title: values.title,
              projects: values.videoInfo?.videos.map((video) => ({
                title: video.name,
                description: video.description || video.name,
                videoId: video.shortUUID,
                host: video.account.host,
                duration: video.duration,
                thumbnailURL: video.thumbnailURL,
                metadata: video.metadata,
                keywords: values.keywords,
                shared: values.shared,
              })),
              description: values.description,
              public: values.public,
              collaborative: values.collaborative,
              objective: "",
              levelStart: 0,
              levelEnd: 5,
              shared: values.shared,
              userId: "",
            });
            if (playlist) {
              formik.resetForm();
              router.replace(`/project/${playlist.projects[0].id}`);
            }
          }
        } catch (e) {
          if (
            e instanceof Error &&
            e.message === ERR_ALREADY_EXISTING_PROJECT
          ) {
            formik.setFieldError(
              "title",
              humanizeError("ERR_ALREADY_EXISTING_PROJECT")
            );
          } else {
            formik.setFieldError("title", humanizeError("ERR_UNKOWN"));
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="title"
          name="title"
          label={t("project.title")}
          fullWidth
          autoFocus
          autoComplete="none"
          spellCheck={false}
          margin="normal"
          inputProps={{
            "data-testid": "title",
          }}
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          disabled={isSubmitting}
        />
        <TextField
          id="description"
          name="description"
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
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.description && Boolean(formik.errors.description)
          }
          helperText={formik.touched.description && formik.errors.description}
          disabled={isSubmitting}
        />

        <AutoCompleteTags
          id="keywords"
          options={[""]}
          onChange={(_event, newValue) => {
            formik.setFieldValue("keywords", newValue);
          }}
          disabled={isSubmitting}
          value={formik.values.keywords}
          textFieldProps={{
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
            paddingTop: 4,
          }}
          gutterBottom={true}
        >
          {t("project.visibilitySection")}
        </Typography>
        <Grid container={true} direction="row" alignItems="flex-start">
          <Grid item={true} xs={2}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                paddingTop: 1,
              }}
            >
              {t("project.public")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              data-testid="public-switch"
              checked={formik.values.public}
              onChange={(_, value) => {
                formik.setFieldValue("public", value);
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography
              gutterBottom
              variant="body2"
              sx={{
                paddingTop: 1,
              }}
            >
              {t("project.publicHelper")}
            </Typography>
          </Grid>
        </Grid>

        <Grid container direction="row">
          <Grid item xs={2}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                paddingTop: 1,
              }}
            >
              {t("project.collaborative")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              checked={formik.values.collaborative}
              data-testid="collaborative-switch"
              onChange={(_, value) => {
                formik.setFieldValue("collaborative", value);
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                paddingTop: 1,
              }}
            >
              {t("project.collaborativeHelper")}
            </Typography>
          </Grid>
        </Grid>

        <Grid container direction="row">
          <Grid item xs={2}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                paddingTop: 1,
              }}
            >
              {t("project.shared")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              checked={formik.values.shared}
              data-testid="shared-switch"
              onChange={(_, value) => {
                formik.setFieldValue("shared", value);
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                paddingTop: 1,
              }}
            >
              {t("project.sharedHelper")}
            </Typography>
          </Grid>
        </Grid>

        <Box display={"flex"} justifyContent={"flex-end"} flex={1} mt={2}>
          <LoadingButton
            variant="contained"
            data-testid="submit"
            size="large"
            color="primary"
            type="submit"
            loading={playlistMutation.isPending || projectMutation.isPending}
            disabled={playlistMutation.isPending || projectMutation.isPending}
          >
            {t("project.createAction")}
          </LoadingButton>
        </Box>
      </form>
    </>
  );
}
