import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
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
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import Image from "mui-image";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";

import { AddVideoToPlaylistDialog } from "~components/AddVideoToPlaylistDialog";
import { StyledTitle } from "~components/typography";
import {
  getPeerTubeVideoData,
  PeerTubeVideoDataResult,
  PeerTubeVideoWithThumbnail,
} from "~services/peertube";
import { ERR_ALREADY_EXISTING_PROJECT } from "~utils/Constants";
// import { formatDuration } from "~utils/DurationUtils";
import { humanizeError } from "~utils/errors";
import { trpc } from "~utils/trpc";

const THUMBNAIL_WIDTH = 250;

type PeerTubeVideoUrlFormProps = {
  onLoaded: (data: PeerTubeVideoDataResult | null) => void;
  data: PeerTubeVideoDataResult | null;
};

const PeerTubeVideoUrlForm: React.FC<PeerTubeVideoUrlFormProps> = ({
  onLoaded,
  data,
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
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (values.data) {
        onLoaded(values.data);
      }
      formik.setStatus("submited");
    },
    onReset: () => {
      onLoaded(null);
    },
  });

  useEffect(() => {
    if (data == null && formik.status == "submited") {
      formik.resetForm();
    }
  }, [data, formik]);

  const query = useQuery({
    queryKey: ["getPeerTubeVideoData", formik.values.url],
    queryFn: () => getPeerTubeVideoData(formik.values.url),
    enabled: !formik.errors.url && formik.status != "submited",
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
              <LinkIcon />
            </InputAdornment>
          ),
          endAdornment:
            formik.status == "submited" ? (
              <InputAdornment position="end">
                {query.isFetched && query.data && query.data.isPlaylist ? (
                  <Chip label={"Playlist"} size="small" variant="outlined" />
                ) : (
                  <Chip label="Video" size="small" variant="outlined" />
                )}

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

const CreateProjectForm: React.FC<{ data: PeerTubeVideoDataResult }> = ({
  data,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const playlistMutation = trpc.playlist.add.useMutation();
  const projectMutation = trpc.project.add.useMutation();

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
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      keywords: [],
      public: false,
      collaborative: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (!data.isPlaylist) {
          const video = data.videos[0];
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
            objective: "",
            levelStart: 0,
            levelEnd: 5,
            shared: false,
          });
          if (project) {
            formik.resetForm();
            navigate(`/project/${project.id}`);
          }
        } else {
          const playlist = await playlistMutation.mutateAsync({
            title: values.title,
            projects: data.videos.map((video) => ({
              title: video.name,
              description: video.description,
              videoId: video.shortUUID,
              host: video.account.host,
              duration: video.duration,
              thumbnailURL: video.thumbnailURL,
              metadata: video.metadata,
            })),
            description: values.description,
            public: values.public,
            collaborative: values.collaborative,
            objective: "",
            levelStart: 0,
            levelEnd: 5,
            shared: false,
            userId: "",
          });
          if (playlist) {
            formik.resetForm();
            navigate(`/projects/${playlist.projects[0].id}`);
          }
        }
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
          loading={playlistMutation.isLoading || projectMutation.isLoading}
          disabled={playlistMutation.isLoading || projectMutation.isLoading}
        >
          <Trans i18nKey="project.createAction" />
        </LoadingButton>
      </Box>
    </form>
  );
};

const AddVideoButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
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
        height={180}
      >
        <ButtonBase sx={{ height: "100%" }} onClick={onClick}>
          <Stack
            flex={1}
            marginX={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <PlaylistAddIcon sx={{ color: "neutral.500" }} fontSize="large" />
            <Typography variant="body2" color="neutral.500">
              <Trans i18nKey={"project.add-video-to-playlist-button"}>
                Ajouter une vidéo à la liste de lecture
              </Trans>
            </Typography>
          </Stack>
        </ButtonBase>
      </Stack>
    </Grid>
  );
};

const VideoSnap: React.FC<{
  video: PeerTubeVideoWithThumbnail;
  onDelete: () => void;
}> = ({ video, onDelete }) => {
  return (
    <Grid item>
      <Box sx={{ position: "absolute", zIndex: 1 }} width={THUMBNAIL_WIDTH}>
        <Box display={"flex"} justifyContent="flex-end">
          <IconButton aria-label="delete" onClick={onDelete}>
            <CloseIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
      </Box>
      <Stack sx={{ backgroundColor: "black" }} width={250} height={180}>
        <Image
          src={video.thumbnailURL}
          showLoading={<CircularProgress />}
          bgColor="#000000"
        />
        <Stack flex={1} marginX={1} marginBottom={1}>
          <Typography
            variant="body2"
            color={"white"}
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
            }}
          >
            {video.name}
          </Typography>
        </Stack>
      </Stack>
    </Grid>
  );
};

const PeerTubeVideoSnapshots: React.FC<{
  videos: PeerTubeVideoWithThumbnail[];
  isPlaylist: boolean;
  onDelete: (index: number) => void;
  onAddMore: () => void;
}> = ({ videos, isPlaylist, onDelete, onAddMore }) => {
  // const { i18n } = useTranslation();
  return (
    <Box
      marginTop={2}
      sx={{ backgroundColor: "neutral.100" }}
      padding={2}
      borderRadius={1}
    >
      <Grid container rowSpacing={1} columnSpacing={1}>
        {videos.map((video, index) => (
          <VideoSnap
            video={video}
            key={video.id}
            onDelete={() => onDelete(index)}
          />
        ))}
        {/* {!isPlaylist && <AddVideoButton onClick={onAddMore} />} */}
        <AddVideoButton onClick={onAddMore} />
      </Grid>
    </Box>
  );
};

export const CreateProjectPage: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<PeerTubeVideoDataResult | null>(
    null
  );

  const handleVideoInfoLoaded = (data: PeerTubeVideoDataResult | null) => {
    setVideoInfo(data);
  };

  const handleDelete = (index: number) => {
    if (videoInfo) {
      const newVideos = videoInfo.videos.filter((_, i) => i != index);
      if (newVideos.length == 0) {
        setVideoInfo(null);
      } else {
        setVideoInfo({
          ...videoInfo,
          isPlaylist: newVideos.length > 1,
          videos: newVideos,
        });
      }
    }
  };

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleAddVideo = (video: PeerTubeVideoWithThumbnail) => {
    if (videoInfo) {
      const newVideos = [...videoInfo.videos, video];
      setVideoInfo({
        ...videoInfo,
        isPlaylist: true,
        videos: newVideos,
      });
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  console.log(videoInfo);
  return (
    <Box
      sx={{
        paddingX: 5,
        paddingTop: 1,
        paddingBottom: "70%",
        backgroundColor: "brand.orange",
        height: "100%",
      }}
    >
      <Container maxWidth="md">
        <Paper sx={{ padding: 5 }}>
          <StyledTitle gutterBottom={true} variant="h4" sx={{ marginTop: 1 }}>
            <Trans i18nKey="project.createTitle" />
          </StyledTitle>

          <PeerTubeVideoUrlForm
            onLoaded={handleVideoInfoLoaded}
            data={videoInfo}
          />

          {videoInfo ? (
            <PeerTubeVideoSnapshots
              videos={videoInfo.videos}
              onDelete={handleDelete}
              onAddMore={handleClickOpen}
              isPlaylist={videoInfo.isPlaylist}
            />
          ) : null}

          {videoInfo ? <CreateProjectForm data={videoInfo} /> : null}
        </Paper>
        <AddVideoToPlaylistDialog
          open={openDialog}
          onClose={handleClose}
          onAddVideo={handleAddVideo}
        />
      </Container>
    </Box>
  );
};
