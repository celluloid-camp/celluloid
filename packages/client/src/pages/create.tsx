import { PeerTubeVideo, ProjectCreateData } from "@celluloid/types";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SearchIcon from "@mui/icons-material/Search";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
// import moment from "moment";
import Image from "mui-image";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";

import { StyledTitle } from "~components/typography";
import { ERR_ALREADY_EXISTING_PROJECT } from "~services/Constants";
import Projects from "~services/ProjectService";
import { getPeerTubeVideoData } from "~services/VideoService";
// import { formatDuration } from "~utils/DurationUtils";
import { humanizeError } from "~utils/errors";

const THUMBNAIL_WIDTH = 250;

type PeerTubeVideoUrlFormProps = {
  onLoaded: (data: PeerTubeVideo | null) => void;
};

const PeerTubeVideoUrlForm: React.FC<PeerTubeVideoUrlFormProps> = ({
  onLoaded,
}) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    data: Yup.object(),
    url: Yup.string()
      .url(t("project.create.url.not-valid") || "")
      .required(t("project.create.url.required") || ""),
  });

  const formik = useFormik({
    initialValues: {
      url: "",
      data: null,
    },
    isInitialValid: false,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (values.data) {
        onLoaded(values.data as PeerTubeVideo);
      }
      formik.setStatus("submited");
    },
    onReset: () => {
      onLoaded(null);
    },
  });

  const query = useQuery({
    queryKey: ["getPeerTubeVideoData", formik.values.url],
    queryFn: () => getPeerTubeVideoData(formik.values.url),
    enabled: formik.isValid,
    onSuccess: (data) => {
      formik.setFieldValue("data", data);
      formik.setFieldTouched("data");
      formik.submitForm();
    },
    onError: () => {
      formik.setFieldError(
        "url",
        t("project.create.error.video-info-failed") || ""
      );
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        id="url"
        name="url"
        label={t("home.addVideo")}
        fullWidth
        margin="normal"
        value={formik.values.url}
        placeholder={t("home.addVideo") || ""}
        onChange={formik.handleChange}
        disabled={formik.status == "submited"}
        onBlur={formik.handleBlur}
        error={formik.touched.url && Boolean(formik.errors.url)}
        helperText={formik.touched.url && formik.errors.url}
        sx={{ borderRadius: 20 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {query.isFetching ? (
                <CircularProgress size={20} />
              ) : (
                <SearchIcon />
              )}
            </InputAdornment>
          ),
          endAdornment:
            formik.status == "submited" ? (
              <InputAdornment position="end">
                <IconButton onClick={handleReset} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
        }}
      />
    </form>
  );
};

const CreateProjectForm: React.FC<{ video: PeerTubeVideo }> = ({ video }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (newProject: ProjectCreateData) => {
      return Projects.create(newProject);
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(5, "Le titre doit comporter au moins 5 caractères.")
      .required("Le titre est requis."),
    description: Yup.string().required("La description est requise."),
    keywords: Yup.array().of(Yup.string()),
    public: Yup.bool(),
    collaborative: Yup.bool(),
  });

  const formik = useFormik({
    initialValues: {
      title: video.name,
      description: "",
      keywords: [],
      public: false,
      collaborative: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const res = await mutation.mutateAsync({
          videoId: video.shortUUID,
          title: values.title,
          host: video.account.host,
          description: values.description,
          public: values.public,
          collaborative: values.collaborative,
          assignments: [],
          tags: [],
          objective: "",
          levelStart: 0,
          levelEnd: 5,
        });
        formik.resetForm();
        navigate(`/projects/${res.id}`);
      } catch (e) {
        if (e.message == ERR_ALREADY_EXISTING_PROJECT) {
          formik.setFieldError(
            "title",
            humanizeError(ERR_ALREADY_EXISTING_PROJECT)
          );
        } else {
          formik.setFieldError(
            "title",
            humanizeError(ERR_ALREADY_EXISTING_PROJECT)
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
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
        spellCheck={false}
        margin="normal"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        disabled={isSubmitting}
      />
      <Autocomplete
        multiple
        id="keywords"
        options={[""]}
        freeSolo
        onChange={(_event, newValue) => {
          formik.setFieldValue("keywords", newValue);
        }}
        disabled={isSubmitting}
        value={formik.values.keywords}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            margin="normal"
            label={t("project.keywords")}
          />
        )}
      />

      <Typography
        variant="h6"
        sx={{
          paddingTop: 4,
        }}
        gutterBottom={true}
      >
        <Trans i18nKey="project.visibilitySection" />
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
            <Trans i18nKey="project.public" />
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Switch
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
            <Trans i18nKey="project.publicHelper" />
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
            <Trans i18nKey="project.collaborative" />
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Switch
            checked={formik.values.collaborative}
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
            <Trans i18nKey="project.collaborativeHelper" />
          </Typography>
        </Grid>
      </Grid>

      <Box display={"flex"} justifyContent={"flex-end"} flex={1} mt={2}>
        <LoadingButton
          variant="contained"
          size="large"
          color="primary"
          type="submit"
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
        >
          <Trans i18nKey="project.createAction" />
        </LoadingButton>
      </Box>
    </form>
  );
};

const AddRelatedVideoPlaceHolder: React.FC = () => {
  return (
    <Grid item xs={6}>
      <Stack
        sx={{
          borderColor: "neutral.300",
          borderRadius: 1,
          borderWidth: 1,
          borderStyle: "solid",
        }}
        width={THUMBNAIL_WIDTH}
        height={"100%"}
      >
        <ButtonBase sx={{ height: "100%" }}>
          <Stack
            flex={1}
            marginX={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <PlaylistAddIcon sx={{ color: "neutral.500" }} fontSize="large" />
            <Typography variant="body2" color="neutral.500">
              <Trans i18nKey={"project.add-related-video"}>
                Add a related video
              </Trans>
            </Typography>
          </Stack>
        </ButtonBase>
      </Stack>
    </Grid>
  );
};

const PeerTubeVideoSnapshot: React.FC<{ video: PeerTubeVideo }> = ({
  video,
}) => {
  // const url = new URL(video.url);
  const thumbnailUrl = `https://${video.account.host}${video.thumbnailPath}`;
  // const { i18n } = useTranslation();
  return (
    <Box
      marginTop={2}
      sx={{ backgroundColor: "neutral.100" }}
      padding={2}
      borderRadius={1}
    >
      <Grid container rowSpacing={1} columnSpacing={1}>
        <Grid item>
          <Box sx={{ position: "absolute", zIndex: 1 }} width={THUMBNAIL_WIDTH}>
            <Box display={"flex"} justifyContent="flex-end">
              <IconButton aria-label="delete">
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>
          </Box>
          <Stack sx={{ backgroundColor: "black" }} width={250}>
            <Image
              src={thumbnailUrl}
              showLoading={<CircularProgress />}
              bgColor="#000000"
            />
            <Stack flex={1} marginX={1} marginBottom={1}>
              <Typography variant="body2" color={"white"}>
                {video.name}
              </Typography>
              {/* <Typography variant="body2">{video.account.displayName}</Typography>
          <Typography variant="caption">
            {video.account.host} - {formatDuration(video.duration)}
          </Typography>
          <Typography variant="caption">
            {moment(video.createdAt)
              .locale(i18n.language.substring(0, 2))
              .format("LLL")}
          </Typography> */}
            </Stack>
          </Stack>
        </Grid>
        <AddRelatedVideoPlaceHolder />
      </Grid>
    </Box>
  );
};

export const CreateProjectPage: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<PeerTubeVideo | null>(null);

  const handleVideoInfoLoaded = (data: PeerTubeVideo | null) => {
    setVideoInfo(data);
  };

  return (
    <Box sx={{ paddingX: 5, paddingY: 1, backgroundColor: "brand.orange" }}>
      <Container sx={{ height: "100vh" }} maxWidth="md">
        <Paper sx={{ marginTop: 10, padding: 5 }}>
          <StyledTitle gutterBottom={true} variant="h4" sx={{ marginTop: 1 }}>
            <Trans i18nKey="project.createTitle" />
          </StyledTitle>

          <PeerTubeVideoUrlForm onLoaded={handleVideoInfoLoaded} />

          {videoInfo ? <PeerTubeVideoSnapshot video={videoInfo} /> : null}

          {videoInfo ? <CreateProjectForm video={videoInfo} /> : null}
        </Paper>
      </Container>
    </Box>
  );
};
