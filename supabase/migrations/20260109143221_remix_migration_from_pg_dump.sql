CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: account_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_type AS ENUM (
    'checking',
    'savings',
    'cash',
    'investment'
);


--
-- Name: document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_type AS ENUM (
    'PF',
    'PJ'
);


--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status AS ENUM (
    'trial',
    'active',
    'cancelled',
    'expired'
);


--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    type public.account_type DEFAULT 'checking'::public.account_type NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    color text DEFAULT '#10b981'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: card_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credit_card_id uuid NOT NULL,
    account_id uuid,
    description text NOT NULL,
    amount numeric NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    category_id uuid,
    is_installment boolean DEFAULT false NOT NULL,
    installment_count integer DEFAULT 1,
    installment_value numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    icon text DEFAULT 'tag'::text,
    color text DEFAULT '#10b981'::text,
    type public.transaction_type NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credit_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    card_limit numeric(15,2) NOT NULL,
    closing_day integer NOT NULL,
    due_day integer NOT NULL,
    color text DEFAULT '#10b981'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid,
    CONSTRAINT credit_cards_closing_day_check CHECK (((closing_day >= 1) AND (closing_day <= 31))),
    CONSTRAINT credit_cards_due_day_check CHECK (((due_day >= 1) AND (due_day <= 31)))
);


--
-- Name: fixed_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fixed_bills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid,
    name text NOT NULL,
    amount numeric NOT NULL,
    category_id uuid,
    due_day integer DEFAULT 1 NOT NULL,
    frequency text DEFAULT 'monthly'::text NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    next_due_date date NOT NULL,
    importance text DEFAULT 'normal'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    description text NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    total_installments integer NOT NULL,
    current_installment integer DEFAULT 1 NOT NULL,
    credit_card_id uuid,
    start_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    document_type public.document_type NOT NULL,
    document_number text NOT NULL,
    subscription_status public.subscription_status DEFAULT 'trial'::public.subscription_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid,
    category_id uuid,
    credit_card_id uuid,
    installment_id uuid,
    amount numeric(15,2) NOT NULL,
    description text NOT NULL,
    type public.transaction_type NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    is_fixed boolean DEFAULT false NOT NULL,
    attachment_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: card_purchases card_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_purchases
    ADD CONSTRAINT card_purchases_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: credit_cards credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_pkey PRIMARY KEY (id);


--
-- Name: fixed_bills fixed_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_bills
    ADD CONSTRAINT fixed_bills_pkey PRIMARY KEY (id);


--
-- Name: installments installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: accounts update_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: credit_cards update_credit_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: fixed_bills update_fixed_bills_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fixed_bills_updated_at BEFORE UPDATE ON public.fixed_bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: card_purchases card_purchases_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_purchases
    ADD CONSTRAINT card_purchases_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: card_purchases card_purchases_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_purchases
    ADD CONSTRAINT card_purchases_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: card_purchases card_purchases_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_purchases
    ADD CONSTRAINT card_purchases_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON DELETE CASCADE;


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: credit_cards credit_cards_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: credit_cards credit_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: fixed_bills fixed_bills_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_bills
    ADD CONSTRAINT fixed_bills_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: fixed_bills fixed_bills_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_bills
    ADD CONSTRAINT fixed_bills_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: installments installments_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: installments installments_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON DELETE SET NULL;


--
-- Name: installments installments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_installment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_installment_id_fkey FOREIGN KEY (installment_id) REFERENCES public.installments(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: accounts Users can delete own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: card_purchases Users can delete own card purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own card purchases" ON public.card_purchases FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: categories Users can delete own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (((auth.uid() = user_id) AND (is_system = false)));


--
-- Name: credit_cards Users can delete own credit cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own credit cards" ON public.credit_cards FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: fixed_bills Users can delete own fixed bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own fixed bills" ON public.fixed_bills FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: installments Users can delete own installments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own installments" ON public.installments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: transactions Users can delete own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: accounts Users can insert own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: card_purchases Users can insert own card purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own card purchases" ON public.card_purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: categories Users can insert own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (is_system = false)));


--
-- Name: credit_cards Users can insert own credit cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own credit cards" ON public.credit_cards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: fixed_bills Users can insert own fixed bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own fixed bills" ON public.fixed_bills FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: installments Users can insert own installments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own installments" ON public.installments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: transactions Users can insert own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: accounts Users can update own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: card_purchases Users can update own card purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own card purchases" ON public.card_purchases FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: categories Users can update own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (((auth.uid() = user_id) AND (is_system = false)));


--
-- Name: credit_cards Users can update own credit cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own credit cards" ON public.credit_cards FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: fixed_bills Users can update own fixed bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own fixed bills" ON public.fixed_bills FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: installments Users can update own installments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own installments" ON public.installments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: transactions Users can update own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: accounts Users can view own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: card_purchases Users can view own card purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own card purchases" ON public.card_purchases FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: credit_cards Users can view own credit cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own credit cards" ON public.credit_cards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: fixed_bills Users can view own fixed bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own fixed bills" ON public.fixed_bills FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: installments Users can view own installments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own installments" ON public.installments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories Users can view system categories and own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view system categories and own categories" ON public.categories FOR SELECT USING (((is_system = true) OR (auth.uid() = user_id)));


--
-- Name: accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: card_purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.card_purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: fixed_bills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fixed_bills ENABLE ROW LEVEL SECURITY;

--
-- Name: installments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;