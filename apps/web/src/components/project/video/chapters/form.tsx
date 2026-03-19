import { zodResolver } from "@hookform/resolvers/zod";
import PlusIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import DeleteIcon from "@mui/icons-material/Delete";
import LoopIcon from "@mui/icons-material/Loop";
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grow,
  InputBase,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ChapterByProjectId, ProjectById, UserMe } from "@/lib/trpc/types";
import { ChapterTimestampSlider } from "./slider";

type ChapterFormProps = {
  project: ProjectById;
  user?: User;
  chapters: ChapterByProjectId[];
};

export const ChapterForm: React.FC<ChapterFormProps> = (props) => {
  const [showForm, setShowForm] = useState(false);

  const [openMenu, setOpenMenu] = useState(false);

  const confirm = useConfirm();
  const t = useTranslations();

  const api = useTRPC();
  const queryClient = useQueryClient();
  const resetMutation = useMutation(api.chapter.reset.mutationOptions());
  const regenerateMutation = useMutation(
    api.chapter.generate.mutationOptions(),
  );

  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleCloseMenu = () => {
    setOpenMenu(false);
  };

  const handleToggle = () => {
    setOpenMenu((prevOpen) => !prevOpen);
  };

  const handleReset = () => {
    confirm({
      title: t("chapters.form.reset.confirm.title"),
      description: t("chapters.form.reset.confirm.description"),
      confirmationText: t("deleteAction"),
      cancellationText: t("cancelAction"),
      confirmationButtonProps: {
        variant: "contained",
        color: "error",
      },
      contentProps: {
        sx: {
          color: "white",
          backgroundColor: "background.dark",
        },
      },
      titleProps: {
        sx: {
          color: "white",
          backgroundColor: "background.dark",
        },
      },
      dialogActionsProps: {
        sx: {
          backgroundColor: "background.dark",
        },
      },
    }).then(async (value) => {
      if (value.confirmed) {
        await resetMutation.mutateAsync({
          projectId: props.project.id,
        });
        queryClient.invalidateQueries(
          api.chapter.byProjectId.queryFilter({
            projectId: props.project.id,
          }),
        );
      }
    });
  };

  const handleRegenerate = () => {
    confirm({
      title: "Regenerate chapters",
      description: "Are you sure you want to regenerate the chapters?",
      confirmationText: "Regenerate",
      cancellationText: "Cancel",
      confirmationButtonProps: {
        variant: "contained",
        color: "primary",
      },
      contentProps: {
        sx: {
          color: "white",
          backgroundColor: "background.dark",
        },
      },
      titleProps: {
        sx: {
          color: "white",
          backgroundColor: "background.dark",
        },
      },
      dialogActionsProps: {
        sx: {
          backgroundColor: "background.dark",
        },
      },
    }).then(async (value) => {
      if (value.confirmed) {
        await regenerateMutation.mutateAsync({
          projectId: props.project.id,
        });
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        paddingX: 2,
        paddingTop: 2,
        borderTop: 1,
        borderColor: grey[800],
      }}
    >
      <ButtonGroup
        variant="outlined"
        color="secondary"
        size="small"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button onClick={handleOpenForm} startIcon={<PlusIcon />}>
          {t("chapters.form.button.add")}
        </Button>
        <Button
          size="small"
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{ width: 10 }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={openMenu}
        anchorEl={anchorRef.current}
        sx={{
          backgroundColor: "background.dark",
          color: "white",
          zIndex: 1,
        }}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleCloseMenu}>
                <MenuList id="split-button-menu" autoFocusItem>
                  <MenuItem
                    onClick={handleReset}
                    disabled={
                      resetMutation.isPending || props.chapters.length === 0
                    }
                  >
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>

                    <ListItemText>
                      {t("chapters.form.button.reset")}
                    </ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={handleRegenerate}
                    disabled={regenerateMutation.isPending}
                  >
                    <ListItemIcon>
                      <LoopIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                      {t("chapters.form.button.regenerate")}
                    </ListItemText>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      <ChapterFormContent
        open={showForm}
        onClose={handleCloseForm}
        {...props}
      />
    </Box>
  );
};

const createChapterSchema = z.object({
  startTime: z.number().nonnegative(),
  stopTime: z.number().nonnegative(),
  title: z.string().min(2, "Title must be at least 2 characters").max(250),
  description: z.string().max(250).optional().or(z.literal("")),
});

type CreateChapterFormValues = z.infer<typeof createChapterSchema>;

export const ChapterFormContent: React.FC<
  ChapterFormProps & {
    onClose: () => void;
    open: boolean;
  }
> = ({ project, onClose, open }) => {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const createMutation = useMutation(api.chapter.create.mutationOptions());

  const t = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm<CreateChapterFormValues>({
    resolver: zodResolver(createChapterSchema),
    mode: "onChange",
    defaultValues: {
      startTime: 0,
      stopTime: 600, // 10 minutes
      title: "",
      description: "",
    },
  });

  const startTime = watch("startTime");
  const stopTime = watch("stopTime");

  const onSubmit = async (values: CreateChapterFormValues) => {
    const newChapter = await createMutation.mutateAsync({
      projectId: project.id,
      title: values.title,
      description: values.description,
      startTime: values.startTime,
      endTime: values.stopTime,
    });
    if (newChapter) {
      reset();
      handleClose();
    }
    queryClient.invalidateQueries(
      api.chapter.byProjectId.queryFilter({ projectId: project.id }),
    );
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: "background.dark",
          color: "white",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "white",
          backgroundColor: "background.dark",
        }}
      >
        {t("chapters.form.button.add")}
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "background.dark",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flexShrink: 0, paddingX: 2 }}
        >
          <Box sx={{ paddingX: 2 }}>
            <ChapterTimestampSlider
              duration={project.duration}
              startTime={startTime}
              stopTime={stopTime}
              sx={{ mt: 2 }}
              onChange={(start, stop) => {
                setValue("startTime", start, { shouldValidate: true });
                setValue("stopTime", stop, { shouldValidate: true });
              }}
            />
          </Box>
          <Box
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              backgroundColor: grey[800],
              borderRadius: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, color: "white" }}
              placeholder={t("chapters.form.title.placeholder")}
              disabled={isSubmitting}
              inputProps={{
                "aria-label": "Title",
                maxLength: 250,
              }}
              {...register("title")}
            />
          </Box>
          <Box
            sx={{
              p: "2px 4px",
              display: "flex",
              marginTop: 2,
              alignItems: "center",
              backgroundColor: grey[800],
              borderRadius: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, color: "white" }}
              placeholder={t("chapters.form.description.placeholder")}
              multiline
              maxRows={5}
              minRows={2}
              disabled={isSubmitting}
              inputProps={{
                "aria-label": "Chapter description",
                maxLength: 250,
              }}
              {...register("description")}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "background.dark",
        }}
      >
        <Button
          size="small"
          onClick={handleClose}
          sx={{
            color: grey[500],
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={!isValid || isSubmitting}
          disableElevation
          sx={{
            "&:disabled": {
              color: grey[500],
              backgroundColor: grey[700],
            },
          }}
          onClick={handleSubmit(onSubmit)}
        >
          {t("common.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
