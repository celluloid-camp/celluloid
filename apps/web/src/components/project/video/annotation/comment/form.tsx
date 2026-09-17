import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  ClickAwayListener,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar } from "@/components/common/avatar";
import { TransparentInput } from "@/components/common/transparent-input";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";

interface CommentFormProps {
  user: User | undefined;
  project: ProjectById;
  annotation: AnnotationByProjectId;
  onClose: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  user,
  project,
  annotation,
  onClose,
}) => {
  const t = useTranslations();

  const api = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(api.comment.add.mutationOptions());

  const commentSchema = z.object({
    comment: z.string().min(2, t("project.video.annotation.comment.minLength")),
  });
  type CommentFormValues = z.infer<typeof commentSchema>;

  const handleClose = () => {
    onClose();
  };

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit = async (values: CommentFormValues) => {
    const newComment = await mutation.mutateAsync({
      annotationId: annotation.id,
      projectId: project.id,
      comment: values.comment,
    });
    if (newComment) {
      reset({ comment: "" });
      onClose();
    }
    queryClient.invalidateQueries(
      api.annotation.byProjectId.queryFilter({ id: project.id }),
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ClickAwayListener onClickAway={() => reset({ comment: "" })}>
        <Box>
          <ListItem sx={{ pl: 4, py: 0 }}>
            <ListItemAvatar sx={{ minWidth: 35 }}>
              <Avatar
                sx={{
                  background: user?.color,
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: user?.color,
                  borderStyle: "solid",
                }}
                src={user?.image || undefined}
              >
                {user?.initial}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <React.Fragment>
                  <TransparentInput
                    id="comment"
                    unpadded={true}
                    name="comment"
                    placeholder={t("annotation.commentPlaceholder") || ""}
                    value={watch("comment")}
                    onChange={(event) =>
                      setValue("comment", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                    error={undefined}
                    sx={{ fontSize: 13 }}
                    inputProps={{
                      "aria-label": "Saissez votre annotation",
                      maxLength: 250,
                    }}
                    maxRows={3}
                    minRows={1}
                    disabled={isSubmitting}
                    // endAdornment={
                    //   <InputAdornment position="end">
                    //     <IconButton
                    //       aria-label="Send"
                    //       onClick={() => handleSubmit(onSubmit)()}
                    //       disabled={isSubmitting}
                    //       edge="end"
                    //       color="success"
                    //     >
                    //       <SendIcon />
                    //     </IconButton>
                    //   </InputAdornment>
                    // }
                  />
                </React.Fragment>
              }
            />
          </ListItem>
          <ListItem sx={{ pl: 0, py: 0.5, justifyContent: "flex-end" }}>
            <Box>
              <Button
                size="small"
                onClick={handleClose}
                sx={{
                  color: grey[500],
                  borderRadius: 10,
                  fontSize: 12,
                }}
              >
                {t("annotation.comment.cancel")}
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!isValid || isSubmitting}
                disableElevation
                type="submit"
                sx={{
                  borderRadius: 10,
                  fontSize: 12,
                  "&:disabled": {
                    color: grey[500],
                    backgroundColor: grey[700],
                  },
                }}
              >
                {t("annotation.comment.send")}
              </Button>
            </Box>
          </ListItem>
        </Box>
      </ClickAwayListener>
    </form>
  );
};
