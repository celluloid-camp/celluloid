--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'Admin',
    'Teacher',
    'Student'
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Annotation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Annotation" (
    id uuid NOT NULL,
    text text NOT NULL,
    "startTime" real NOT NULL,
    "stopTime" real NOT NULL,
    pause boolean NOT NULL,
    "userId" uuid NOT NULL,
    "projectId" uuid NOT NULL
);


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    "annotationId" uuid NOT NULL
);


--
-- Name: Language; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Language" (
    id character(3) NOT NULL,
    name text
);


--
-- Name: Project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Project" (
    id uuid NOT NULL,
    "videoId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    assignments text[],
    views integer NOT NULL,
    shares integer NOT NULL,
    "publishedAt" timestamp without time zone NOT NULL,
    objective text NOT NULL,
    "levelStart" integer NOT NULL,
    "levelEnd" integer NOT NULL,
    public boolean NOT NULL,
    collaborative boolean NOT NULL,
    "langId" character(3) NOT NULL,
    "userId" uuid NOT NULL,
    shared boolean DEFAULT false NOT NULL,
    "shareName" text,
    "shareExpiresAt" timestamp without time zone
);


--
-- Name: Tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tag" (
    id uuid NOT NULL,
    name text NOT NULL,
    featured boolean NOT NULL,
    "langId" character(3) NOT NULL
);


--
-- Name: TagToProject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TagToProject" (
    "tagId" uuid NOT NULL,
    "projectId" uuid NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id uuid NOT NULL,
    email text,
    password text NOT NULL,
    confirmed boolean,
    code character(6),
    "codeGeneratedAt" timestamp without time zone,
    username text,
    role public."UserRole" DEFAULT 'Teacher'::public."UserRole"
);


--
-- Name: Annotation Annotation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Annotation"
    ADD CONSTRAINT "Annotation_pkey" PRIMARY KEY (id);


--
-- Name: Language Language_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Language"
    ADD CONSTRAINT "Language_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Tag Subjects_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Subjects_name_key" UNIQUE (name);


--
-- Name: Tag Subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Subjects_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: TagToProjectTagIdProjectIdUnique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TagToProjectTagIdProjectIdUnique" ON public."TagToProject" USING btree ("tagId", "projectId");


--
-- Name: Annotation Annotation_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Annotation"
    ADD CONSTRAINT "Annotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id);


--
-- Name: Annotation Annotation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Annotation"
    ADD CONSTRAINT "Annotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- Name: Comment Comment_annotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES public."Annotation"(id);


--
-- Name: Project Project_langId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_langId_fkey" FOREIGN KEY ("langId") REFERENCES public."Language"(id);


--
-- Name: Project Project_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- Name: TagToProject TagToProject_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TagToProject"
    ADD CONSTRAINT "TagToProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id);


--
-- Name: TagToProject TagToProject_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TagToProject"
    ADD CONSTRAINT "TagToProject_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id);


--
-- Name: Tag Tag_langId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_langId_fkey" FOREIGN KEY ("langId") REFERENCES public."Language"(id);


--
-- PostgreSQL database dump complete
--

