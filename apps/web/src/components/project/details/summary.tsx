import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	colors,
	IconButton,
	Stack,
	Typography,
} from "@mui/material";
import type * as React from "react";
import { useTranslations } from "next-intl";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar } from "@/components/common/avatar";
import type { ProjectById } from "@/lib/trpc/types";
import Link from "next/link";
import type { User } from "@/lib/auth-client";

interface Props {
	project: ProjectById;
	user?: User;
}

export function ProjectSummary({ project, user }: Props) {
	const t = useTranslations();

	return (
		<Box sx={{ padding: 0 }}>
			{project?.playlist ? (
				<Typography
					align="justify"
					variant="body1"
					sx={{ fontFamily: "abril_fatfaceregular" }}
				>
					{t("project.summary.playlist.title")}
					{project.playlist.title}
				</Typography>
			) : null}

			<Typography align="left" variant="h3">
				{project.title}
			</Typography>

			<Box display="flex" alignItems={"center"}>
				<Avatar
					sx={{
						background: project.user.color,
						borderWidth: 2,
						borderColor: project.user.color,
						borderStyle: "solid",
					}}
					src={project.user.avatar?.publicUrl}
				>
					{project.user.initial}
				</Avatar>
				<Box display="flex" flexDirection={"column"} sx={{ marginLeft: 1 }}>
					<Typography>{project.user.username}</Typography>
					<Typography variant="caption">
						{new Date(project.publishedAt).toLocaleDateString()}
					</Typography>
				</Box>
			</Box>

			<Stack direction={"row"} spacing={1} sx={{ my: 2, minHeight: 25 }}>
				{project.public && (
					<Chip
						label={t("project.public")}
						size="small"
						icon={<PublicIcon />}
					/>
				)}

				{project.collaborative && (
					<Chip
						label={t("project.collaborative")}
						size="small"
						icon={<GroupsIcon />}
					/>
				)}
				{project.keywords.map((k) => (
					<Chip key={k} label={k} size="small" />
				))}
			</Stack>

			<Card sx={{ my: 2 }}>
				<CardHeader
					title={t("project.description")}
					sx={{ p: 2, borderBottom: `1px solid ${colors.grey[300]}` }}
					action={
						user && user.id === project.user.id ? (
							<Link href={`/project/${project.id}/edit`}>
								<Button variant="text" size="small" startIcon={<EditIcon />}>
									{t("project.edit.button")}
								</Button>
							</Link>
						) : null
					}
				/>
				<CardContent>
					<Typography variant="caption">{project.description}</Typography>
					<Typography
						align="left"
						gutterBottom={true}
						variant="body2"
						fontWeight={"bold"}
					>
						{t("project.URL_title")}
					</Typography>

					<Typography align="left" gutterBottom={true} variant="body2">
						<a
							href={`https://${project.host}/w/${project.videoId}`}
							target="_blank"
							rel="noreferrer"
						>
							{t("project.videoUrlHelper")}
						</a>
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
