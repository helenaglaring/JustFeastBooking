//Create DB "justfeast"


//DROP DATABASE IF EXISTS justfeastdb;
// CREATE DATABASE justfeastdb;

//\c justfeastdb;

const pool = require('./server/db/db');

/*
CREATE DATABASE justfeastdb
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

* */

/*
pool.query(` 
    CREATE TABLE 
        public.product  (
            product_id integer NOT NULL DEFAULT nextval('product_product_id_seq'::regclass),
            product_name character varying(255) COLLATE pg_catalog."default",
            product_price integer,
            CONSTRAINT product_pkey PRIMARY KEY (product_id)
        );
    
    CREATE TABLE 
        public."user"   (
            user_id integer NOT NULL DEFAULT nextval('user_user_id_seq'::regclass),
            first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
            last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
            _password character varying(255) COLLATE pg_catalog."default" NOT NULL,
            address_id integer,
            email character varying(255) COLLATE pg_catalog."default" NOT NULL,
            phone character varying(255) COLLATE pg_catalog."default",
            created_date date NOT NULL DEFAULT now(),
            CONSTRAINT user_pkey PRIMARY KEY (user_id)
        );
    
    CREATE TABLE 
        public."order"  (
        order_id integer NOT NULL DEFAULT nextval('order_order_id_seq'::regclass),
        user_id integer NOT NULL,
        order_date date DEFAULT now(),
        status character varying(255) COLLATE pg_catalog."default",
        comment character varying(255) COLLATE pg_catalog."default",
        CONSTRAINT order_pkey PRIMARY KEY (order_id),
        CONSTRAINT order_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public."user" (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
    );
    
    CREATE TABLE
        public.lineitem (
            product_id integer NOT NULL,
            order_id integer NOT NULL,
            qty integer NOT NULL,
            lineitem_price integer NOT NULL,
            CONSTRAINT lineitem_pkey PRIMARY KEY (product_id, order_id),
            CONSTRAINT lineitem_order_id_fkey FOREIGN KEY (order_id)
                REFERENCES public."order" (order_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE,
            CONSTRAINT lineitem_product_id_fkey FOREIGN KEY (product_id)
                REFERENCES public.product (product_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
        );
    

    CREATE TABLE 
        public.address  (
            address_id integer NOT NULL DEFAULT nextval('address_address_id_seq'::regclass),
            user_id integer NOT NULL,
            streetname character varying(255) COLLATE pg_catalog."default",
            city character varying(255) COLLATE pg_catalog."default",
            zipcode integer,
            streetnumber character varying(255) COLLATE pg_catalog."default",
            CONSTRAINT address_pkey PRIMARY KEY (address_id),
            CONSTRAINT user_id_constraint UNIQUE (user_id),
            CONSTRAINT address_user_id_fkey FOREIGN KEY (user_id)
                REFERENCES public."user" (user_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
        );

    ALTER TABLE "user"
        ADD CONSTRAINT IF NOT EXISTS fk_user_address FOREIGN KEY (address_id) REFERENCES address (address_id)
        ON DELETE CASCADE;
        

    CREATE TABLE 
        public.delivery    (
            delivery_id integer NOT NULL DEFAULT nextval('delivery_delivery_id_seq'::regclass),
            order_id integer NOT NULL,
            delivery boolean DEFAULT false,
            delivery_time character varying(255) COLLATE pg_catalog."default" NOT NULL,
            CONSTRAINT delivery_pkey PRIMARY KEY (delivery_id),
            CONSTRAINT order_id_constraint UNIQUE (order_id),
            CONSTRAINT delivery_order_id_fkey FOREIGN KEY (order_id)
                REFERENCES public."order" (order_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
        );

        
    CREATE TABLE 
        public.payment (
            payment_id integer NOT NULL DEFAULT nextval('payment_payment_id_seq'::regclass),
            order_id integer NOT NULL,
            user_id integer NOT NULL,
            amount integer,
            payment_date date DEFAULT now(),
            CONSTRAINT payment_pkey PRIMARY KEY (payment_id),
            CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id)
                REFERENCES public."order" (order_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE,
            CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id)
                REFERENCES public."user" (user_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
        );

    INSERT INTO product (product_id, product_name, product_price)
        VALUES
            (DEFAULT, 'Burger', 45),
            (DEFAULT, 'Fries', 25),
            (DEFAULT, 'Water', 10) ;

    
`)
    .then( (res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });

*/

pool.query(`
    CREATE TABLE IF NOT EXISTS
        product (
            product_id SERIAL NOT NULL,
            product_name character varying (255) NOT NULL,
            product_price integer NOT NULL,
            CONSTRAINT product_pkey PRIMARY KEY (product_id)
        );

    CREATE TABLE IF NOT EXISTS
        "user" (
            user_id SERIAL NOT NULL,
            first_name character varying (255) NOT NULL,
            last_name character varying (255) NOT NULL,
            _password character varying (255) NOT NULL,
            address_id integer,
            email character varying (255) NOT NULL,
            phone character varying (255),
            created_date date NOT NULL DEFAULT NOW()
            CONSTRAINT user_pkey PRIMARY KEY (user_id)
        );

    CREATE TABLE IF NOT EXISTS
        "order" (
            order_id SERIAL NOT NULL,
            user_id integer NOT NULL,
            order_date date DEFAULT now(),
            status character varying (255),
            comment character varying (255),
            CONSTRAINT order_pkey PRIMARY KEY (order_id),
            CONSTRAINT order_user_id_fkey FOREIGN KEY (user_id)
                REFERENCES public."user" (user_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
        );

    CREATE TABLE IF NOT EXISTS
        lineitem (
            product_id integer NOT NULL,
            order_id integer NOT NULL,
            qty integer NOT NULL,
            lineitem_price integer NOT NULL,
            CONSTRAINT lineitem_pkey PRIMARY KEY (product_id, order_id),
            CONSTRAINT lineitem_order_id_fkey FOREIGN KEY (order_id)
                REFERENCES public."order" (order_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE,
            CONSTRAINT lineitem_product_id_fkey FOREIGN KEY (product_id)
                REFERENCES public.product (product_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
        );

    CREATE TABLE IF NOT EXISTS
        address (
            address_id SERIAL NOT NULL,
            user_id int NOT NULL,
            streetname character varying (255),
            streetnumber character varying (255),
            zipcode integer,
            city character varying (255),
            CONSTRAINT address_pkey PRIMARY KEY (address_id),
            CONSTRAINT user_id_constraint UNIQUE (user_id),
            CONSTRAINT address_user_id_fkey FOREIGN KEY (user_id)
                REFERENCES public."user" (user_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
         );

    ALTER TABLE "user"
        ADD CONSTRAINT IF NOT EXISTS fk_user_address
            FOREIGN KEY (address_id)
            REFERENCES address (address_id)
            ON DELETE CASCADE;

    CREATE TABLE IF NOT EXISTS
        delivery (
            delivery_id SERIAL NOT NULL,
            order_id integer NOT NULL,
            delivery boolean DEFAULT FALSE,
            delivery_time character varying(255) NOT NULL,
            CONSTRAINT delivery_pkey PRIMARY KEY (delivery_id),
            CONSTRAINT order_id_constraint UNIQUE (order_id),
            CONSTRAINT delivery_order_id_fkey FOREIGN KEY (order_id)
                REFERENCES public."order" (order_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
        );

    CREATE TABLE IF NOT EXISTS
        payment (
            payment_id SERIAL NOT NULL,
            order_id integer NOT NULL,
            user_id integer,
            amount integer,
            payment_date date DEFAULT NOW()
            CONSTRAINT payment_pkey PRIMARY KEY (payment_id),
            CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id)
                REFERENCES public."order" (order_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE,
            CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id)
                REFERENCES public."user" (user_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
        );

    INSERT INTO product (product_id, product_name, product_price)
        VALUES
            (DEFAULT, 'Burger', 45),
            (DEFAULT, 'Fries', 25),
            (DEFAULT, 'Water', 10) ;
            
           

    CREATE TABLE "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);
    
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    
    CREATE INDEX "IDX_session_expire" ON "session" ("expire");

    `)
    .then( (res) => {
    console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });



