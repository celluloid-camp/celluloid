import {
  Box,
  Card,
  CardContent,
  Container,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import type React from "react";
import { useParams } from "react-router-dom";

import { trpc } from "~utils/trpc";
import type { AnnotationStats, ProjectById } from "~utils/trpc";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ArcElement,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  calcAnnotationType,
  calcEmotion,
  calcEmotionByMode,
  calcJugement,
} from "~/lib/emotion/stats";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => 12),
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => 20),
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

interface Props {
  project: ProjectById;
  annotations: AnnotationStats;
}

const ProjectStatsContent = ({ project, annotations }: Props) => (
  <Box display={"flex"} flexDirection={"column"}>
    <Box
      sx={{
        backgroundColor: "brand.orange",
        paddingY: 3,
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            paddingY: 2,
            paddingX: 4,
            margin: 0,
            backgroundColor: "brand.green",
          }}
        >
          <Typography variant="h2">{project.title}</Typography>
          <Card sx={{ my: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Bar Charts */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ minHeight: 50 }}
                    >
                      Fréquence de chaque émotion
                    </Typography>
                    <Bar options={options} data={calcEmotion(annotations)} />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ minHeight: 50 }}
                    >
                      Fréquence de chaque émotion en mode déclaratif et
                      automatique
                    </Typography>
                    <Bar
                      options={options}
                      data={calcEmotionByMode(annotations)}
                    />
                  </Paper>
                </Grid>

                {/* Pie/Doughnut Charts */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ minHeight: 50 }}
                    >
                      Résultats des jugements
                    </Typography>
                    <Doughnut
                      options={options}
                      data={calcJugement(annotations)}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ minHeight: 50 }}
                    >
                      Résultats des annotations sémantiques
                    </Typography>
                    <Doughnut
                      options={options}
                      data={calcAnnotationType(annotations)}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ minHeight: 50 }}
                    >
                      Les types des annotations
                    </Typography>
                    <Pie
                      options={options}
                      data={calcAnnotationType(annotations)}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  </Box>
);

const ProjectStatsPage: React.FC = () => {
  const { projectId } = useParams();
  const { data: user } = trpc.user.me.useQuery();
  const { data: project } = trpc.project.byId.useQuery(
    { id: projectId },
    {
      enabled: !!projectId,
    }
  );

  const { data: annotations } = trpc.annotation.stats.useQuery(
    { id: projectId },
    {
      enabled: !!projectId,
    }
  );

  if (!project) return null;

  return <ProjectStatsContent project={project} annotations={annotations} />;
};
export default ProjectStatsPage;
