import i18next from "i18next"



export const humanizeError = (e: string) => {

  if (e == "ERR_ALREADY_EXISTING_PROJECT")
    return i18next.t("ERR_ALREADY_EXISTING_PROJECT", "Un projet avec le même titre existe déjà, veuillez renommer le projet")
  else
    return i18next.t("ERR_UNKOWN", "Une erreur inconnue s'est produite. Veuillez réessayer ultérieurement ou contacter le support pour obtenir de l'aide.")

}
