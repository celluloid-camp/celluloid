import { Typography } from "@material-ui/core";
import React from "react";
import { SharedLayout } from "scenes/Menu";

const LegalNotice: React.FC<any> = () => (
  <SharedLayout>
    <div
      style={{
        padding: 48,
        maxWidth: 1024,
        margin: "0 auto",
      }}
    >
      <Typography variant="h2" gutterBottom={true}>
        Mentions légales
      </Typography>
      <Typography component="div">
        <p>
          En accédant ou en utilisant le Site Web,{" "}
          <a href="https://celluloid.huma-num.fr">celluloid.huma-num.fr</a>,
          exploité par l'Institut Catholique de Paris, ("ICP"), vous acceptez
          les termes des Règles de confidentialité en ligne présentées ci-après.
          Si vous n'êtes pas d'accord avec ces termes, veuillez ne plus utiliser
          ou accéder à ce site.
        </p>
        <p>
          <b>Editeur :</b>
          <br />
          Institut Catholique de Paris
          <br />
          21, rue d'Assas
          <br />
          75270 PARIS Cedex 06
        </p>
        <p>
          Les informations et documents présentés sur{" "}
          <b>celluloid.huma-num.fr</b>
          sont fournis sans aucune garantie expresse ou tacite ; le site peut
          présenter des erreurs techniques et typographiques ou autres
          inexactitudes, ce que vous reconnaissez et acceptez en utilisant le
          site.
        </p>
        <p>
          L’Institut Catholique de Paris ne saurait être tenu pour responsable
          des erreurs ou omissions présentées sur son site ou par tout document
          référencé. Les informations contenues dans le site ne sont pas
          contractuelles et sont sujettes à modification sans préavis.
        </p>
        <p>
          Les informations présentées sur le site font régulièrement l'objet de
          mises à jour. Mais en aucune circonstance, l’Institut Catholique de
          Paris ne sera responsable des préjudices fortuits, directs ou
          indirects résultant de l'utilisation des éléments du Site.
        </p>
        <p>
          <b>Directeurs de la publication :</b> Michael Bourgatte et Laurent
          Tessier
        </p>
        <p>
          <b>Conception :</b> Erwan Quéffelec
        </p>
        <p>
          <b>Réalisation et hébergement :</b> Erwan Quéffelec, Souleymane Thiam
          et Guillaume Aichhorn
        </p>
        <p>
          Celluloid est un projet open source, partagé ici :{" "}
          <a href="https://github.com/celluloid-edu">
            github.com/celluloid-edu
          </a>
          . Les contenus du site internet Celluloid ainsi que leur structuration
          en catégories et thématiques font l’objet d’une licence{" "}
          <a href="https://opensource.org/licenses/MIT">MIT</a>.
        </p>
      </Typography>
      <Typography variant="h4" gutterBottom={true}>
        Protections des données personnelles
      </Typography>
      <Typography component="div">
        <p>
          Dans certaines fonctionnalités et rubriques proposées sur ce site,
          telles que demande d'information, demande d'inscription, vous devez
          remplir et envoyer un formulaire en ligne. Ces activités sont
          facultatives et n'ont aucun caractère obligatoire.
        </p>
        <p>
          Cependant, si vous décidez de participer à l'une d'entre elles,
          Celluloid peut vous demander de fournir certaines informations telles
          que vos nom, adresse e-mail et autres données d'identification
          personnelles.
        </p>
        <p>
          Lorsque vous envoyez des informations personnelles à Celluloid dans le
          cadre d'une de ces rubriques particulières, vous reconnaissez et
          acceptez le fait que Celluloid peut avoir besoin, pour la réalisation
          de l'opération et la mise à jour des fichiers associés, de transférer,
          stocker et traiter ces informations.
        </p>
        <p>
          Celluloid recueille ces informations afin d'enregistrer et de prendre
          en compte votre participation dans les activités que vous avez
          choisies. Si vous demandez une documentation, par exemple, ces
          informations sont utilisées pour enregistrer vos coordonnées afin de
          pouvoir vous l'envoyer.
        </p>
        <p>
          Le site celluloid.camp est enregistré à la CNIL sous le numéro
          1086038.
        </p>
      </Typography>
      <Typography variant="h4" gutterBottom={true}>
        Mise à jour de vos informations personnelles
      </Typography>
      <Typography component="div">
        <p>
          Vous êtes en droit d'accéder et de modifier vos informations
          personnelles et préférences en matière de confidentialité. Pour ce
          faire, envoyez un courrier à l'Institut Catholique de Paris à
          l'adresse suivante :
        </p>
        <p>
          Atelier du numérique
          <br />
          Institut Catholique de Paris
          <br />
          21, rue d'Assas
          <br />
          75270 PARIS Cedex 06
        </p>
        <p>
          ou par courriel :{" "}
          <a href="mailto:celluloid@icp.fr">celluloid@icp.fr</a>
        </p>
      </Typography>
      <Typography variant="h4" gutterBottom={true}>
        Utilisation des "Cookies"
      </Typography>
      <Typography component="div">
        <p>
          Lorsque vous visitez le site internet de l'Institut Catholique de
          Paris, vous pouvez l'explorer de manière anonyme et accéder à des
          informations sans révéler votre identité. Vous restez anonyme sauf si
          vous avez vous-même fourni à l'Institut Catholique de Paris des
          informations personnelles.
        </p>
        <p>
          Un cookie est un petit volume de données qui est transféré à votre
          navigateur par un serveur Web et qui ne peut être lu que par le
          serveur qui vous l'a envoyé. Il fonctionne comme une carte d'identité,
          en enregistrant vos mots de passe, et préférences. Il ne s'agit pas
          d'un code exécutable et il ne peut pas transmettre de virus. Les
          informations stockées dans ce cookie sont cryptées de manière à éviter
          un usage de votre ordinateur à votre insu. Celluloid utilise un cookie
          technique qui ne collecte pas les données de navigation. Les cookies
          associés aux vidéos visionnées dans le cadre de Celluloid sont
          bloqués.
        </p>
        <p>
          La plupart des navigateurs sont configurés pour accepter les cookies.
          Vous pouvez aussi configurer votre navigateur pour qu'il vous signale
          les cookies qu'il reçoit, vous permettant ainsi de les accepter ou de
          les refuser.
        </p>
      </Typography>
      <Typography variant="h4" gutterBottom={true}>
        Responsabilité des vidéos et des projets créés dans Celluloid
      </Typography>
      <Typography component="div">
        <p>
          Celluloid est un projet à visée pédagogique. Les projets créés dans
          Celluloid associent un créateur de projet (qui peut par exemple être
          un enseignant) et des participants à ce projet (qui peuvent par
          exemple être ses élèves). Dans tous les cas, l’utilisateur qui crée un
          projet dans Celluloid et y associe une vidéo lue depuis un site tiers
          (PeerTube) est responsable du projet et de l’usage de la vidéo qui y
          est faite :
        </p>
        <p>
          Il devra s’assurer que les droits d’usage de la vidéo utilisée sont
          acquittés. Dans le cas contraire, il prend le risque de voir le projet
          et la vidéo supprimés, par Celluloid et/ou par l’hébergeur de la
          vidéo.
        </p>
        <p>
          Il devra s’assurer que l’ensemble des écrits rédigés dans le cadre de
          son projet (objectifs, consignes, commentaires laissés par les
          participants) sont conformes au droit français. Il devra modérer les
          commentaires laissés par les participants et supprimer, le cas
          échéant, ceux qui porteraient atteinte au droit. Dans le cas
          contraire, et notamment en cas de plainte d’un participant, Celluloid
          se réserve le droit de supprimer le projet, sans préavis et sans
          possibilité de recours du créateur du projet ni de ses participants.
        </p>
        <p>
          Les vidéos utilisées dans le cadre des projets créés dans Celluloid
          sont hébergé par des sites tiers (PeerTube notamment). Le contenu de
          ces vidéos ne sauraient engager la responsabilité des responsables
          éditoriaux de Celluloid. Pour supprimer une vidéo sdont le contenu
          serait inapproprié, l'utilisateur devra s'adresser directement à
          l'hébergeur.
        </p>
      </Typography>
    </div>
  </SharedLayout>
);

export default LegalNotice;
