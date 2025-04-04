import {
	Box,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import type * as React from "react";
import { useTranslations } from "next-intl";

import { Avatar } from "@/components/common/avatar";
import type { ProjectById, ProjectMembers } from "@/lib/trpc/types";
import { useLocaleRole } from "@/i18n/roles";
import type { User } from "@/lib/auth-client";

interface SideBarProps {
	project: ProjectById;
	user?: User;
}

export const Members: React.FC<SideBarProps> = ({ project, user }) => {
	const t = useTranslations();

	const localeRole = useLocaleRole();

	return (
		<Paper
			sx={{
				paddingX: 3,
				marginY: 2,
				paddingY: 3,
			}}
		>
			<Typography variant="h6" mb={2}>
				{t("project.members", { count: String(project._count.members) })}
			</Typography>
			<List
				dense={true}
				sx={{
					width: "100%",
					maxWidth: 360,
					bgcolor: "neutral.100",
					position: "relative",
					overflow: "auto",
					borderRadius: 2,
					minHeight: 300,
					maxHeight: 300,
					"& ul": { padding: 0 },
				}}
			>
				<ListItem>
					<Stack direction="row" spacing={1} alignItems="center">
						<Avatar
							src={project.user.avatar?.publicUrl}
							sx={{
								background: project.user.color,
								borderWidth: 2,
								borderColor: project.user.color,
								borderStyle: "solid",
								width: 30,
								height: 30,
							}}
						>
							{project.user.initial}
						</Avatar>
						<Stack direction="column" spacing={0}>
							<Typography variant="body2">{project.user.username}</Typography>
							<Typography fontSize={10}>
								{localeRole(project.user.role ?? null)}
							</Typography>
						</Stack>
					</Stack>
				</ListItem>

				{project.members.map((member: ProjectMembers) => (
					<ListItem key={member.id}>
						<ListItemAvatar>
							<Avatar
								sx={{
									background: member.user?.color,
									borderWidth: 2,
									borderColor: member.user?.color,
									borderStyle: "solid",
								}}
								src={member.user?.avatar?.publicUrl}
							>
								{member.user?.initial}
							</Avatar>
						</ListItemAvatar>
						<ListItemText
							primary={member.user?.username}
							secondary={
								<Typography variant="caption">
									{localeRole(member.user?.role ?? null)}
								</Typography>
							}
						/>
					</ListItem>
				))}
			</List>
		</Paper>
	);
};
