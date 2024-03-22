require(Modules.ASR);

VoxEngine.addEventListener(AppEvents.CallAlerting, (e) => {
  const newAsr = () => (
    VoxEngine.createASR({
      profile: ASRProfileList.Google.de_DE,
      request: {
        config: {
          alternativeLanguageCodes: ['en-US'],
        },
        singleUtterance: true,
      }
    })
  );

  const config = { curLang: 'de', confused: 0 };

  let call = e.call;
  call.answer();
  const isEn = () => config.curLang === 'en';

  const sayoptf = () => ({
    language: isEn() ? VoiceList.Amazon.en_US_Joey : VoiceList.Amazon.de_DE_Hans
  });

  const say = (s) => call.say(s, sayoptf());

  say('Welche frage haben Sie');

  call.addEventListener(CallEvents.PlaybackFinished, () => {
    call.sendMediaTo(asr);
  });

  const asr = newAsr();

  const setDe = () => {
    config.curLang = 'de';
  };

  const setEn = () => {
    config.curLang = 'en';
  };

  const sayBye = () => {
    if (isEn()) {
      say('Goodbye');
    } else {
      say('Aus wiederhören');
    }
  };

  const understood = () => {
    config.confused = 0;
  };

  const confused = () => {
    config.confused++;
  };

  const sayOperator = () => {
    if (isEn()) {
      say('I did not understand you. I will transfer you to the operator.');
    } else {
      say('Ich habe Sie nicht verstanden. Ich werde Sie an den Betreiber weiterleiten.');
    }
  }

  const sayAgain = () => {
    if (isEn()) {
      say('Say that again please');
    } else {
      say('Sagen Sie bitte nochmal');
    }
  }

  const handleError = () => {
    confused();

    if (config.confused > 1) {
      sayOperator();
    } else {
      sayAgain();
    }
  };

  const sayTransfer = (name, greet) => {
    if (isEn()) {
      say((greet ? 'Hello! ' : '') + 'This is connected to ' + name);
    } else {
      say((greet ? 'Guten tag! ' : '') + 'Diese Frage bezieht sich auf das ' + name);
    }
  }

  let redirectPending = null;

  const sayRedirect = (s) => {
    if (isEn()) {
      say('Okay. Now you will connect to ' + s);
    } else {
      say('Okay. Jetzt stellen Sie eine Verbindung zum ' + s + 'her.')
    }
  }

  asr.addEventListener(ASREvents.Result, e => {
    let text = e.text.toLowerCase();
    let has = (words) => {
      return words.some((w) => text.includes(w))
    };

    if (redirectPending) {
      const x = redirectPending;
      redirectPending = null;
      if (has(['ja'])) {
        setDe();
        return sayRedirect(x);
      }
      if (has(['yes'])) {
        setEn();
        return sayRedirect(x);
      }
    }

    let greet = has(['guten tag']);
    
    let cats = [];
    let facts = [];
    for (let cat of DATA) {
      for (let lang of ['en', 'de']) {
        if (has(cat.keywords[lang])) {
          cats.push([cat, lang]);
          break;
        }
      }
      for (let lang of ['en', 'de']) {
        for (let fact of cat.facts) {
          if (has(fact.query[lang].map(x => x.toLowerCase()))) {
            facts.push([fact, lang, cat]);
          } else {
            a = 2;
          }
        }
      }
    }
    if (facts.length === 1) {
      understood();
      if (facts[0][1] == 'en') {
        setEn();
        if (greet) {
          greetS = 'Hello! ';
        } else {
          greetS = '';
        }
      } else {
        setDe();
        if (greet) {
          greetS = 'Guten tag! ';
        } else {
          greetS = '';
        }
      }
      let fact = facts[0][0];
      let lang = facts[0][1];
      if (fact.redirect) {
        redirectPending = facts[0][2].name[lang];
      } else {
        redirectPending = null;
      }
      return say(greetS + fact.answer[lang]);
    }
    if (cats.length === 1) {
      understood();
      if (cats[0][1] == 'en') {
        setEn();
      } else {
        setDe();
      }
      return sayTransfer(cats[0][0].name[cats[0][1]], greet);
    }

    if (has(['das ist alles'])) {
      understood();

      setDe();
      sayBye();
      call.addEventListener(CallEvents.PlaybackFinished, () => VoxEngine.terminate());
    }

    // return say(`You said ${text}`);

    let lang = e.languageCode;

    if (lang[0] == 'd') {
      setDe();
    } else {
      setEn();
    }

    handleError();
  });

  asr.addEventListener(ASREvents.ASRError, e => {
    handleError();
  });

  setTimeout(() => VoxEngine.terminate(), 100000);
});


const DATA = [
  {
    name: {
      en: 'Immigration office',
      de: 'Migrationsamt'
    },
    keywords: {
      de: [
        'bewilligung', 'reisepass', 'ausweis', 'personalausweis', 'identitätskarte', 'visum',

        'migrationsamt', 'migrant', 'migrante', 'schaffe', 'schwiz', 'unterlage', 'unterlaege', 'bewilligt',
        'bewilligung', 'visa', 'migrantkontrolle', 'migrantenkontrolle', 'migrationskontrolle',
        'visaprocess', 'schutz status', 'schutzstatus', 'permit', 'kanton schaffe', 'schwiz schaffe',
        'reise', 'reisedokumaent', 'reisepass', 'reise pass', 'asylgruppe'
      ],
      en: [
        'residence', 'permit'
      ]
    },
    facts: [
      {
        query: {
          en: ['what are the opening hours of the immigration office'],
          de: ['wie sind die öffnungszeiten des migrationsamt']
        },
        answer: {
          en: 'Monday to Friday: 8:00 to 11:30 and 13:30 to 17:00. Saturday and Sunday closed',
          de: 'Montag bis Freitag: 8:00 bis 11:30 Uhr und 13:30 bis 17:00 Uhr. Samstag und Sonntag geschlossen'
        }
      },
      {
        query: {
          en: ['call the migration office'],
          de: ['Migrationsamt anrufen']
        },
        answer: {
          en: 'I can connect you directly with the immigration office. Do you agree?',
          de: 'Ich kann Sie direkt mit das Migrationsamt verbinden. Sind Sie einverstanden?'
        },
        redirect: true
      }
    ]
  },
  {
    name: {
      en: 'Tax office',
      de: 'Steueramt'
    },
    keywords: {
      de: [
        'etaxes', 'etax', 'etaxe', 'steuer', 'efuelig', 'efillig', 'finanzkontrolle', 'finanz', 'steuerforme',
        'rechnig', 'deklaration', 'steuerdeklaration'
      ],
      en: [
        'tax', 'taxes', 'filing', 'finance', 'declaration'
      ]
    },
    facts: [
      {
        query: {
          en: ['tax declaration form'],
          de: ['steuererklärungsformular']
        },
        answer: {
          en: 'Go to www.sg.ch and click on the “Steuererklärung ausfüllen” button.',
          de: 'Gehen Sie auf www.sg.ch und klicken Sie auf den Button "Steuererklärung ausfüllen".'
        }
      }
    ]
  },
  {
    name: {
      en: 'ID card office',
      de: 'Ausweisstelle'
    },
    keywords: {
      de: ['ausweis'],
      en: ['id card']
    },
    facts: [
      {
        query: {
          en: ['How much does a Swiss passport cost'],
          de: ['Wie viel kostet ein Schweizer Pass']
        },
        answer: {
          en: '145 francs for adults, 65 for children',
          de: '145 Franken für Erwachsene, 65 für Kinder'
        }
      }
    ]
  }
];






























