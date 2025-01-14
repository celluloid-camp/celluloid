import type { AnnotationStatsItem } from "~/utils/trpc";

export function calcEmotion(annotations?: AnnotationStatsItem[]) {
  const labels = [
    "Happy",
    "Laugh",
    "Smile",
    "Sad",
    "Surprise",
    "Angry",
    "Disgusted",
    "Fear",
    "Empathy",
    "ItsStrange",
    "Neutral",
  ];
  let happy = 0;
  let laugh = 0;
  let smile = 0;
  let sad = 0;
  let surprise = 0;
  let angry = 0;
  let disgusted = 0;
  let fearful = 0;
  let empathy = 0;
  let itsStrange = 0;
  let neutral = 0;
  annotations?.map((annotation: AnnotationStatsItem) => {
    if (annotation.emotion) {
      if (annotation.emotion === "happy") {
        happy++;
      } else if (annotation.emotion === "laugh") {
        laugh++;
      } else if (annotation.emotion === "smile") {
        smile++;
      } else if (annotation.emotion === "sad") {
        sad++;
      } else if (annotation.emotion === "surprised") {
        surprise++;
      } else if (annotation.emotion === "angry") {
        angry++;
      } else if (annotation.emotion === "disgusted") {
        disgusted++;
      } else if (annotation.emotion === "fearful") {
        fearful++;
      } else if (annotation.emotion === "empathy") {
        empathy++;
      } else if (annotation.emotion === "itsStrange") {
        itsStrange++;
      } else if (annotation.emotion === "neutral") {
        neutral++;
      }
    }
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: "nombre de réaction",
        data: [
          happy,
          laugh,
          smile,
          sad,
          surprise,
          angry,
          disgusted,
          fearful,
          empathy,
          itsStrange,
          neutral
        ],
        maxBarThickness: 30,
        backgroundColor: ["#0B9A8D"],
      },
    ],
  };
  return data;
}



export function calcEmotionByMode(annotations?: AnnotationStatsItem[]) {
  const labels = [
    'Happy',
    'Laugh',
    'Smile',
    'Sad',
    'Surprise',
    'Angry',
    'Disgusted',
    'Fear',
    'Empathy',
    "ItsStrange",
    "Neutral",
  ];
  let happy = 0;
  let laugh = 0;
  let smile = 0;
  let sad = 0;
  let surprise = 0;
  let angry = 0;
  let disgusted = 0;
  let fearful = 0;
  let empathy = 0;
  let itsStrange = 0;
  let neutral = 0;
  let happyAut = 0;
  let laughAut = 0;
  let smileAut = 0;
  let sadAut = 0;
  let surpriseAut = 0;
  let angryAut = 0;
  let disgustedAut = 0;
  let fearfulAut = 0;
  let empathyAut = 0;
  let itsStrangeAut = 0;
  let neutralAut = 0;
  annotations?.map((annotation: AnnotationStatsItem) => {
    if (annotation.emotion) {
      if (annotation.emotion === 'happy') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          happyAut++;
        } else {
          happy++;
        }
      } else if (annotation.emotion === 'laugh') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          laughAut++;
        } else {
          laugh++;
        }
      } else if (annotation.emotion === 'smile') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          smileAut++;
        } else {
          smile++;
        }
      } else if (annotation.emotion === 'sad') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          sadAut++;
        } else {
          sad++;
        }
      } else if (annotation.emotion === 'surprised') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          surpriseAut++;
        } else {
          surprise++;
        }
      } else if (annotation.emotion === 'angry') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          angryAut++;
        } else {
          angry++;
        }
      } else if (annotation.emotion === 'disgusted') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          disgustedAut++;
        } else {
          disgusted++;
        }
      } else if (annotation.emotion === 'fearful') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          fearfulAut++;
        } else {
          fearful++;
        }
      } else if (annotation.emotion === 'empathy') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          empathyAut++;
        } else {
          empathy++;
        }
      } else if (annotation.emotion === 'itsStrange') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          itsStrangeAut++;
        } else {
          itsStrange++;
        }
      } else if (annotation.emotion === 'neutral') {
        if (annotation.detection === 'auto' || annotation.mode === "semi-auto") {
          neutralAut++;
        } else {
          neutral++;
        }
      }
    }
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'automatique',
        data: [
          happyAut,
          laughAut,
          smileAut,
          sadAut,
          surpriseAut,
          angryAut,
          disgustedAut,
          fearfulAut,
          empathyAut,
          itsStrangeAut,
          neutralAut,
        ],
        maxBarThickness: 30,
        barPercentage: 0.5,
        backgroundColor: ['#D5255E'],
      },
      {
        label: 'déclaratif',
        data: [
          happy,
          laugh,
          smile,
          sad,
          surprise,
          angry,
          disgusted,
          fearful,
          empathy,
          itsStrange,
          neutral,
        ],
        maxBarThickness: 30,
        barPercentage: 0.5,
        backgroundColor: ["#0B9A8D"],
      },
    ],
  };
  return data;
}


export function calcJugement(annotations?: AnnotationStatsItem[]) {
  let iLike = 0;
  let iDontLike = 0;
  let itsStrange = 0;

  annotations?.map((annotation: AnnotationStatsItem) => {
    if (annotation.emotion) {
      if (annotation.emotion === 'iLike') {
        iLike++;
      } else if (annotation.emotion === 'iDontLike') {
        iDontLike++;
      } else if (annotation.emotion === 'itsStrange') {
        itsStrange++;
        console.log('nb stag ', itsStrange);
      }
    }
  });
  const data = {
    labels: ['iLike', 'iDontLike', 'itsStrange'],
    datasets: [
      {
        label: 'Jugements',
        data: [iLike, iDontLike, itsStrange],
        backgroundColor: ['#87ccdb', '#58508d', '#fd878a'],
      },
    ],
  };
  return data;
}



export function calcAnnotationType(annotations?: AnnotationStatsItem[]) {
  let automatique = 0;
  let sa = 0;
  let comment = 0;
  let emoji = 0;

  annotations?.map((annotation: AnnotationStatsItem) => {
    if (annotation.text) {
      comment++;
    } else if (annotation.mode === "auto") {
      automatique++;
    } else if (annotation.mode === "semi-auto") {
      sa++;
    } else if (
      annotation.emotion !== null &&
      annotation.mode !== "auto" &&
      annotation.mode !== "semi-auto"
    ) {
      emoji++;
    }
  });

  const data = {
    labels: ['Automatique', 'SA', 'Commentaire', 'Emojis'],
    datasets: [
      {
        label: 'Modes',
        data: [automatique, sa, comment, emoji],
        backgroundColor: ['#772F67', '#9C2162', '#D03454', '#FF6F50'],
      },
    ],
  };
  return data;
}
