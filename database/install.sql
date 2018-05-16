CREATE DATABASE  IF NOT EXISTS urlaubsverwaltung_WS2015_WebProgrammierung /*!40100 DEFAULT CHARACTER SET latin1 */;
USE urlaubsverwaltung_WS2015_WebProgrammierung;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Tabellenstruktur uv_abteilung
--

drop table if exists uv_abteilung;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
create table uv_abteilung (
abteilung_nr smallint auto_increment,
abteilung varchar(20) not null,
Primary Key (abteilung_nr));

--
-- Daten in Tabelle uv_abteilung einfügen
--

LOCK TABLES uv_abteilung WRITE;
/*!40000 ALTER TABLE uv_abteilung DISABLE KEYS */;
INSERT INTO uv_abteilung(abteilung) VALUES ('Management'), ('Controlling'), ('IT'), ('Marketing'), ('Einkauf'), ('Vertrieb');
/*!40000 ALTER TABLE uv_abteilung ENABLE KEYS */;
UNLOCK TABLES;

--
-- Tabellenstruktur uv_mitarbeiter
--

drop table if exists uv_mitarbeiter;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
create table uv_mitarbeiter (
personalnummer char(7),
name varchar(30) not null,
vorname varchar(30) not null,
geschlecht enum('m','w') not null,
abteilung smallint,
email varchar(45),
passwort varchar(255) not null,
kz_verwalter boolean,
urlaub_pro_jahr smallint,
Primary Key (personalnummer),
foreign key (abteilung) references uv_abteilung(abteilung_nr) on delete set null);

--
-- Daten in Tabelle uv_mitarbeiter einfügen
--

LOCK TABLES uv_mitarbeiter WRITE;
/*!40000 ALTER TABLE uv_mitarbeiter DISABLE KEYS */;
INSERT INTO uv_mitarbeiter VALUES ('PN00001','Metten','Fabian','m', '1', 'fabian.metten@gmx.de','$2y$10$pO9s0V/kTI0dsgLrJmLMI.w1bNXiuS1QlcCxb12gAWUR4KVuEed7q',true, 30),('PN00002','Müller','Nico','m', '2', 'fabian.metten@gmx.de','$2y$10$/njd/OPijZVhGmFGKqaQhuxrPUw8ySbSHgGQyf50vsLse1k2rMyIy', false, 30);
/*!40000 ALTER TABLE uv_mitarbeiter ENABLE KEYS */;
UNLOCK TABLES;

--
-- Tabellenstruktur uv_meldungsart
--

drop table if exists uv_meldungsart;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
create table uv_meldungsart (
meldungsart_nr smallint auto_increment,
meldungsart varchar(12) not null,
Primary Key (meldungsart_nr));

--
-- Daten in Tabelle uv_meldungsart einfügen
--

LOCK TABLES uv_meldungsart WRITE;
/*!40000 ALTER TABLE uv_meldungsart DISABLE KEYS */;
INSERT INTO uv_meldungsart(meldungsart) VALUES ('Urlaub'), ('Krankheit'), ('Sonderurlaub');
/*!40000 ALTER TABLE uv_meldungsart ENABLE KEYS */;
UNLOCK TABLES;

--
-- Tabellenstruktur uv_meldung
--

drop table if exists uv_meldung;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
create table uv_meldung (
meldung_nr int unsigned auto_increment,
personalnummer char(7),
meldungsart smallint,
meldungsstatus enum('Offen', 'Genehmigt', 'Abgelehnt') not null,
vom_dat date not null,
bis_dat date not null,
halber_tag enum('','vorm','nachm') not null,
Primary Key (meldung_nr),
foreign key (meldungsart) references uv_meldungsart (meldungsart_nr) on delete set null,
foreign key (personalnummer) references uv_mitarbeiter (personalnummer) on delete cascade);

--
-- Daten in Tabelle uv_meldung einfügen
--

LOCK TABLES uv_meldung WRITE;
/*!40000 ALTER TABLE uv_meldung DISABLE KEYS */;
INSERT INTO uv_meldung (personalnummer, meldungsart, meldungsstatus, vom_dat, bis_dat, halber_tag) VALUES ('PN00002', 1, 'Offen', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), '');
INSERT INTO uv_meldung (personalnummer, meldungsart, meldungsstatus, vom_dat, bis_dat, halber_tag) VALUES ('PN00001', 1, 'Genehmigt', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), '');
/*!40000 ALTER TABLE uv_meldung ENABLE KEYS */;
UNLOCK TABLES;





