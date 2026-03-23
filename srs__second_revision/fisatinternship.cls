  %% fisatinternship.cls
  %% Copyright 2013 Dr. Reshmi R
  %
  % This program may be distributed and/or modified under the
  % conditions of the LaTeX Project Public License, either version 1.2
  % of this license or (at your option) any later version.
  % The latest version of this license is in
  %   http://www.latex-project.org/lppl.txt
  % and version 1.2 or later is part of all distributions of LaTeX 
  % version 1999/12/01 or later.
  %
  % This program consists of the file fisatinternship.cls

\ProvidesClass{mins}[2/8/2013]
\NeedsTeXFormat{LaTeX2e}

%\DeclareOption*{\InputIfFileExists{\CurrentOption.min}{}{
%\PassOptionsToClass{\CurrentOption}{report}}}

\PassOptionsToClass{notitlepage}{report}

\ProcessOptions \relax

\LoadClass[a4paper,12pt]{report}
%[left=.5in,right=.5in,top=1in,bottom=1in]
\RequirePackage[top=.7in,bottom=.5in]{geometry}
\RequirePackage{graphicx}
\RequirePackage{url}
\RequirePackage{titlesec}
\RequirePackage{listings}
\RequirePackage[toc,page]{appendix}
\usepackage{setspace}

\titleformat{\chapter}[display]
  {\normalfont\Large\bfseries\filcenter}{\chaptertitlename\ \thechapter}{20pt}{\Large}
\titlespacing*{\chapter}
  {0pt}{30pt}{20pt}

\def\title#1{\gdef\@title{#1}\gdef\stored@title{#1}}
\def\author#1{\gdef\@author{#1}\gdef\stored@author{#1}}
\def\team#1{\gdef\@team{#1}\gdef\stored@team{#1}}
\def\guide#1{\gdef\@guide{#1}\gdef\stored@guide{#1}}

\pagenumbering{gobble}

\def\@maketitle{%
  %\vskip 2em%
  \vspace{2cm}
  \begin{center}%
    {\LARGE \@title \par}%
    \vfill
\vskip 1.5em%
\large\textit{SRS- REVISION 2.0}\\[1.5cm]
	{\Large \bf \itshape{{Bachelor of Technology}}}\\[.5cm]
\textit{in}\\[.5cm]
{\Large \bf \itshape{{Computer Science and Design}}}\\[1.5cm]
    \vskip 1.5em%
    {\large
      \lineskip .5em%
      Submitted by\\[.2cm]
      \begin{tabular}[t]{c}%
        \@team
      \end{tabular}\par}%
    \vskip 1em%
   % {\large \@date}%
   \thispagestyle{empty}
  \par
  \vfill
  \includegraphics[scale=2]{fisat}\\[.3cm]
  \large \bfseries{FEDERAL INSTITUTE OF SCIENCE AND TECHNOLOGY (FISAT)\small$^{\textregistered}$}\\
  \small \bfseries{ANGAMALY-683577}\\[.5cm]
  \small {\textit{Affiliated to}}\\[.5cm]
  \normalsize \bfseries{APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY}\\
  \small \bfseries{KERALA}\\
  \end{center}
  }


\newcommand{\makecert}{
\newpage
\vspace{2cm}
\begin{center}
{\large FEDERAL INSTITUTE OF SCIENCE AND TECHNOLOGY (FISAT)\small$^{\textregistered}$}\\
Mookkannoor(P.O), Angamaly-683577
\end{center}
\vspace*{1cm}
\begin{center}
\includegraphics[scale=3]{fisat}\\
\vfill


}
