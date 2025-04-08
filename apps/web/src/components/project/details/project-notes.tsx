"use client";

import type { ProjectById } from "@/lib/trpc/types";
import {
	Card,
	CardContent,
	CardHeader,
	colors,
	Typography,
	Box,
	Divider,
	Stack,
	styled,
	Button,
	ToggleButton,
	CircularProgress,
} from "@mui/material";
import type { User } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
	useEditor,
	EditorContent,
	BubbleMenu,
	FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Strike from "@tiptap/extension-strike";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Mention } from "@/components/titptap/mention";

import { useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import suggestion from "@/components/titptap/suggestion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client";
import dayjs from "@/utils/dayjs";

interface Props {
	project: ProjectById;
	user?: User;
}
export function ProjectNotes({ project, user }: Props) {
	const t = useTranslations();
	const [isSaving, setIsSaving] = useState(false);

	const [data] = trpc.note.byProjectId.useSuspenseQuery({
		projectId: project.id,
	});

	const updateNote = trpc.note.update.useMutation({
		onSuccess: () => {
			setTimeout(() => {
				setIsSaving(false);
			}, 500);
		},
	});

	// Using useCallback to maintain function reference
	const debouncedUpdate = useCallback(
		debounce((content: JSON) => {
			setIsSaving(true);
			updateNote.mutate({
				projectId: project.id,
				content: content,
			});
		}, 5000),
		[],
	);

	const handleUpdate = (content: JSON) => {
		debouncedUpdate(content);
	};

	if (!user) {
		return null;
	}

	return (
		<Card
			sx={{
				my: 2,
				backgroundColor: colors.yellow[50],
				borderRadius: 1,
				boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
				position: "relative",
				overflow: "visible",
				"&:before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: "1.5rem",
					width: "2px",
					height: "100%",
					backgroundColor: colors.red[200],
					zIndex: 1,
				},
			}}
		>
			<Box
				sx={{
					borderBottom: `1px solid ${colors.grey[300]}`,
					backgroundImage: `repeating-linear-gradient(${colors.blue[50]} 0px, ${colors.blue[50]} 29px, ${colors.grey[300]} 29px, ${colors.grey[300]} 30px)`,
					p: 3,
					pt: 2,
					position: "relative",
					borderRadius: 1,
					overflow: "hidden",
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography
						variant="h5"
						sx={{
							color: colors.grey[800],
							mb: 1,
							position: "relative",
							zIndex: 2,
							ml: 2,
						}}
					>
						{t("project.note.title")}
					</Typography>
					{isSaving ? (
						<Stack direction="row" spacing={1} alignItems="center">
							<CircularProgress size={12} color="primary" />
							<Typography variant="body2" color="text.secondary">
								{t("project.note.saving")}.
							</Typography>
						</Stack>
					) : null}
				</Stack>
				<Box
					sx={{
						ml: 2,
						minHeight: "200px",
						maxHeight: "400px",
						overflow: "auto",
					}}
				>
					<TiptapNotes
						content={data?.content as unknown as JSON}
						onUpdate={handleUpdate}
					/>
					{data && (
						<Typography variant="caption" color="text.secondary">
							{t("project.note.update_at")} {dayjs(data?.updatedAt).fromNow()}
						</Typography>
					)}
				</Box>
			</Box>
		</Card>
	);
}

const TiptapNotes = ({
	content,
	onUpdate,
}: { content: JSON; onUpdate: (content: JSON) => void }) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Strike,
			Placeholder.configure({
				placeholder: "Write something...",
			}),
			Markdown,
			// Mention.configure({
			// 	HTMLAttributes: {
			// 		class: "mention",
			// 	},
			// 	suggestion,
			// }),
		],
		content: content,
		onUpdate: ({ editor }) => {
			onUpdate(editor.getJSON() as unknown as JSON);
		},
	});

	return (
		<>
			{editor && (
				<BubbleMenu
					className="bubble-menu"
					tippyOptions={{ duration: 100 }}
					editor={editor}
				>
					<ToggleButton
						size="small"
						value={true}
						selected={editor.isActive("bold")}
						onChange={() => editor.chain().focus().toggleBold().run()}
					>
						<FormatBoldIcon />
					</ToggleButton>
					<ToggleButton
						size="small"
						value={true}
						selected={editor.isActive("italic")}
						onChange={() => editor.chain().focus().toggleItalic().run()}
					>
						<FormatItalicIcon />
					</ToggleButton>
					<ToggleButton
						size="small"
						value={true}
						selected={editor.isActive("strike")}
						onChange={() => editor.chain().focus().toggleStrike().run()}
					>
						<FormatStrikethroughIcon />
					</ToggleButton>
				</BubbleMenu>
			)}

			{editor && (
				<FloatingMenu
					className="floating-menu"
					tippyOptions={{ duration: 100 }}
					editor={editor}
				>
					<ToggleButton
						size="small"
						value={true}
						selected={editor.isActive("heading", { level: 1 })}
						onChange={() =>
							editor.chain().focus().toggleHeading({ level: 1 }).run()
						}
					>
						H1
					</ToggleButton>
					<ToggleButton
						size="small"
						value={true}
						selected={editor.isActive("heading", { level: 2 })}
						onChange={() =>
							editor.chain().focus().toggleHeading({ level: 2 }).run()
						}
					>
						H2
					</ToggleButton>
					<ToggleButton
						size="small"
						value={true}
						selected={editor.isActive("bulletList")}
						onChange={() => editor.chain().focus().toggleBulletList().run()}
					>
						Bullet list
					</ToggleButton>
				</FloatingMenu>
			)}

			<EditorContent editor={editor} />
		</>
	);
};
