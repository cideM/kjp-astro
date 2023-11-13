# KJP Meerbusch

## Voraussetzungen

- [Docker](https://www.docker.com/)
- [GitHub](https://github.com/) Zugriff
- Terminal oder [Visual Studio Code (hat Terminal integriert)](https://code.visualstudio.com/)

## Quickstart

Diese Befehle müssen auch nach jeder Änderung ausgeführt werden (beim ersten Mal langsam danach schneller).

```shell
$ docker build . -t kjp
$ docker run -p 4444:80 kjp
$ open http://localhost:4444
```

## Anleitung

### Bilder für Gallerie und `/praxis` ändern/hinzufügen/löschen

Die Gallerie bezeichnet die Bilder die auf der Startseite gezeigt werden. Die gleichen Bilder werden auf der `/praxis` Seite gezeigt. Die Daten für beide Gallerien befinden sich in `src/content/gallerie/`. Für jedes Bild ist es erforderlich 3 Dateien anzulegen:
- irgendein_name.yaml
- bild_hoch.jpg
- bild_portrait.jpg

Die Namen können alle frei gewählt werden. Die `.yaml` Datei hat folgendes Format:

```yaml
srcLandscape: "./spielecke.jpg"
srcPortrait: "./spielecke_portrait.jpg"
alt: "Bild der Spielecke"
```

Die Dateinamen (`bild_hoch.jpg`, `bild_portrait.jpg`) müssen lediglich den Namen der Bilder entsprechen. `alt` ist Text der angezeigt wird, so lange das Bild noch nicht geladen ist oder für Leute mit Sehbehinderung.

### `/behandlungsangebot` & `/kosten`

Beide Seiten werden basierend auf `.md` ([Markdown](https://www.markdownguide.org/cheat-sheet/)) Dateien erzeugt.

### `/kontakt` (Kontakt & Anfahrt) & `/therapeuten`

Diese Seite ist weder Markdown noch wird sie ausschließlich aus Daten erzeugt. Die Liste der Kontaktdaten für das Team wird aus Daten erstellt, die in `src/content/therapeuten/` leben. Pro Team-Mitglied ist mindestens eine `.md` Datei und ein `.jpg` Bild (im `src/content/therapeuten` Ordner) erforderlich. Die `.md` Dateien werden mit einer Nummer begonnen, welche die Reihenfolge festlegt, in welcher die Team Mitglieder dargestellt werden.

Die `.md` Datei hat eine so genannte "frontmatter" Sektion (Bereich zwischen `---`). `photoAlt` ist wie vorhin ein Bild-Titel. Nach der frontmatter Sektion kann Markdown geschrieben werden (siehe `src/content/therapeuten/1-koennecke.md`). Ist diese nicht leer, so wird auf der "Therapeuten" Seite ein Link angezeigt, zu der Vita.

Der Rest der "Kontakt & Anfahrt" Seite kann einfach in `src/pages/kontakt.astro` mittels HTML angepasst werden.
