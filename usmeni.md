# 🧠 Tema 1 – Sofversko inzenjerstvo za AI sisteme

## ❓ 1. Sta je inteligentan (AI) sistem?

➡️ Inteligentan sistem je softver koji koristi AI komponente i uci iz podataka kako bi donosio odluke ili predikcije, umesto da striktno prati unapred definisana pravila.

---

## ❓ 2. Kako se AI sistem razlikuje od klasicnog softverskog sistema?

➡️ Kod klasicnog softvera programer pise pravila u kodu, dok kod AI sistema model sam uci pravila iz podataka tokom treniranja.

---

## ❓ 3. Kako AI sistem donosi odluke?

➡️ AI sistem analizira ulazne podatke i koristi naucene obrasce iz treninga da bi predvideo ili izabrao najbolju akciju.

---

## ❓ 4. Zasto kazemo da su podaci kljucni za AI?

➡️ Zato sto kvalitet, kolicina i raznovrsnost podataka direktno uticu na to koliko ce model biti tacan i pouzdan.

---

## ❓ 5. Koji su kriterijumi uspeha AI sistema?

➡️ AI sistem mora da ispuni funkcionalne zahteve, ali i da postigne dobre performanse kroz metrike kao sto su accuracy ili F1 score.

---

## ❓ 6. Zasto AI sistemi prirodno prave greske?

➡️ Zato sto uce na osnovu podataka koji nisu savrseni i rade na osnovu verovatnoce, pa ne mogu biti 100% tacni.

---

## ❓ 7. Koje uloge postoje u razvoju AI sistema?

➡️ U razvoj su ukljuceni data engineer (podaci), data scientist (model), ML engineer (deploy) i software engineer (aplikacija).

---

## ❓ 8. Zasto je razvoj AI sistema kompleksniji od klasicnog softvera?

➡️ Zato sto zavisi od eksperimentisanja sa podacima i modelima, pa se cesto vraca na prethodne korake i menja pristup.

---

## ❓ 9. Sta znaci da je razvoj AI sistema iterativan?

➡️ To znaci da se model stalno poboljsava kroz vise ciklusa treniranja, evaluacije i prilagodjavanja.

---

## ❓ 10. Zasto je tesko proceniti vreme razvoja AI projekta?

➡️ Zato sto se ne zna unapred koliko ce biti potrebno da se dobije model sa zadovoljavajucim performansama.

---

## ❓ 11. Koje su kategorije AI proizvoda?

➡️ AI proizvodi se dele na AI alate (tooling), AI servise i primenjeni AI u konkretnim aplikacijama.

---

## ❓ 12. Kako se razlikuje lifecycle AI sistema od klasicnog softvera?

➡️ AI lifecycle ukljucuje rad sa podacima i treniranje modela, dok klasicni softver ide linearno kroz razvoj funkcionalnosti.

---

## ❓ 13. Zasto je interdisciplinarni tim vazan u AI?

➡️ Zato sto AI zahteva znanja iz vise oblasti: programiranja, statistike, obrade podataka i domena problema.

---

## ❓ 14. Sta znaci da AI sistem “evoluira” tokom vremena?

➡️ Model se moze unapredjivati novim podacima i treniranjem, pa se njegovo ponasanje menja kroz vreme.

---

## ❓ 15. Sta je najveca razlika u nacinu razmisljanja kod AI razvoja?

➡️ Umesto pisanja logike korak po korak, fokus je na podacima i pronalazenju modela koji najbolje opisuje problem.

---

# 🛠️ Tema 2 – Biblioteke i okruzenja za AI

---

## ❓ 1. Zasto su AI biblioteke i okruzenja vazni?

➡️ Zato sto znacajno ubrzavaju razvoj AI aplikacija jer vec imaju implementirane algoritme i alate, pa nema potrebe da se sve pravi od nule.

---

## ❓ 2. Koja su najcesca okruzenja za razvoj AI sistema?

➡️ Najcesce se koriste Jupyter Notebook, Google Colab, VS Code i Anaconda, jer omogucavaju lak razvoj, testiranje i vizualizaciju modela.

---

## ❓ 3. Sta je Jupyter Notebook i zasto je popularan?

➡️ Jupyter je interaktivno okruzenje gde se kod izvrsava u celijama, sto omogucava lakse eksperimentisanje i prikaz rezultata korak po korak.

---

## ❓ 4. Sta je Google Colab i koja je njegova prednost?

➡️ Google Colab je cloud verzija Jupyter-a koja omogucava besplatno koriscenje GPU resursa, sto je korisno za treniranje modela.

---

## ❓ 5. Koje su najpoznatije AI biblioteke i njihova osnovna namena?

➡️ TensorFlow i PyTorch za deep learning, Scikit-learn za klasicni ML, OpenCV za slike i HuggingFace za NLP.

---

## ❓ 6. Sta je TensorFlow i gde se koristi?

➡️ TensorFlow je skalabilan framework koji se koristi za treniranje i deploy modela u produkciji, posebno u velikim sistemima.

---

## ❓ 7. Sta je PyTorch i po cemu je poseban?

➡️ PyTorch je fleksibilniji i laksi za razumevanje, zbog cega se cesto koristi u istrazivanju i razvoju novih modela.

---

## ❓ 8. Koja je glavna razlika izmedju TensorFlow i PyTorch?

➡️ TensorFlow je vise orijentisan na produkciju i stabilnost, dok je PyTorch intuitivniji i bolji za eksperimentisanje.

---

## ❓ 9. Sta je Keras i kada se koristi?

➡️ Keras je jednostavan API koji se koristi kao wrapper preko TensorFlow-a za brzo pravljenje neuronskih mreza.

---

## ❓ 10. Sta je Scikit-learn i za koje probleme se koristi?

➡️ Scikit-learn je biblioteka za klasicne ML algoritme kao sto su regresija, klasifikacija i clustering.

---

## ❓ 11. Sta je OpenCV i gde se koristi?

➡️ OpenCV je biblioteka za obradu slika i videa, koristi se u computer vision zadacima kao sto su detekcija objekata.

---

## ❓ 12. Kako se bira odgovarajuca biblioteka ili alat?

➡️ Izbor zavisi od tipa problema, dostupnih resursa i cilja projekta (istrazivanje ili produkcija).

---

## ❓ 13. Koja je razlika izmedju cloud i lokalnog okruzenja?

➡️ Cloud omogucava vise racunarskih resursa i skaliranje, dok lokalno daje vecu kontrolu i privatnost.

---

## ❓ 14. Sta nude velike kompanije u oblasti AI?

➡️ Google, Microsoft, Amazon i IBM nude platforme za razvoj, treniranje i deploy AI modela u cloud okruzenju.

---

# 🎯 Kratak rezime za pamcenje

- Jupyter = eksperimentisanje
- Colab = GPU u cloudu
- TensorFlow = produkcija
- PyTorch = fleksibilnost
- Scikit-learn = klasicni ML
- OpenCV = slike
- HuggingFace = NLP

---

# 📊 Tema 3 – Izvori podataka i predobrada

---

## ❓ 1. Zasto su podaci kljucni za AI sisteme?

➡️ Podaci su osnov na kojem model uci, pa njihov kvalitet, kolicina i raznovrsnost direktno odredjuju koliko ce model biti tacan i pouzdan.

---

## ❓ 2. Koji faktori uticu na kvalitet podataka?

➡️ Najvazniji su tacnost (da podaci nisu pogresni), kolicina (da ih ima dovoljno) i raznovrsnost (da pokrivaju razlicite situacije).

---

## ❓ 3. Koji su osnovni tipovi podataka u AI?

➡️ Postoje strukturirani, polustrukturirani i nestrukturirani podaci, u zavisnosti od toga koliko su organizovani.

---

## ❓ 4. Sta su strukturirani podaci?

➡️ To su podaci organizovani u tabelama (npr. baze i CSV fajlovi), gde je lako raditi pretragu i analizu.

---

## ❓ 5. Sta su polustrukturirani podaci?

➡️ Nemaju striktne tabele, ali imaju neku strukturu, kao sto su JSON ili XML fajlovi.

---

## ❓ 6. Sta su nestrukturirani podaci?

➡️ To su podaci bez jasne strukture, kao sto su tekst, slike, video i audio, i oni cine vecinu realnih podataka.

---

## ❓ 7. Koji su glavni izvori podataka za AI?

➡️ Podaci mogu dolaziti iz internih sistema firme, javnih datasetova, web-a, senzora i IoT uredjaja.

---

## ❓ 8. Sta je predobrada podataka?

➡️ Predobrada je proces ciscenja i pripreme podataka kako bi bili pogodni za treniranje modela.

---

## ❓ 9. Zasto je predobrada neophodna?

➡️ Zato sto realni podaci cesto sadrze greske, nedostajuce vrednosti i sum, sto moze znacajno pogorsati model.

---

## ❓ 10. Koje su najcesce tehnike predobrade?

➡️ Uklanjanje duplikata, popunjavanje nedostajucih vrednosti, normalizacija, skaliranje i kodiranje kategorija.

---

## ❓ 11. Sta su nedostajuci podaci i kako se resavaju?

➡️ To su vrednosti koje nedostaju u datasetu, a resavaju se brisanjem redova ili popunjavanjem prosekom ili drugim metodama.

---

## ❓ 12. Sta znaci normalizacija i skaliranje?

➡️ To su tehnike koje dovode podatke u isti opseg kako bi model lakse i stabilnije ucio.

---

## ❓ 13. Zasto nestrukturirani podaci zahtevaju vise obrade?

➡️ Zato sto nemaju jasnu formu, pa ih je potrebno transformisati u numericki oblik pre treniranja modela.

---

## ❓ 14. Sta znaci da su podaci “gorivo za AI”?

➡️ Bez kvalitetnih podataka model ne moze da nauci dobre obrasce, pa ce i rezultati biti losi.

---

## ❓ 15. Kako losi podaci uticu na model?

➡️ Model uci pogresne obrasce, sto dovodi do losih predikcija i nepouzdanih rezultata.

---

# 🎯 Kratak rezime za pamcenje

- Podaci = najvazniji deo AI
- Tipovi: strukturirani / polu / nestrukturirani
- Predobrada = ciscenje + priprema
- Garbage in → garbage out

---

# 🧬 Tema 4 – Bioloski inspirisani algoritmi

---

## ❓ 1. Sta su bioloski inspirisani algoritmi?

➡️ To su algoritmi koji su nastali po uzoru na prirodne procese (evolucija, ponasanje zivotinja), i koriste se za resavanje kompleksnih problema.

---

## ❓ 2. Zasto se priroda koristi kao inspiracija?

➡️ Zato sto prirodni sistemi vec milionima godina pronalaze dobra resenja u slozenim situacijama, pa se ti principi mogu primeniti i u racunarstvu.

---

## ❓ 3. U kojim problemima se ovi algoritmi najvise koriste?

➡️ Najcesce u optimizaciji, planiranju i problemima gde nema jasnog matematickog resenja.

---

## ❓ 4. Koje su glavne prednosti ovih algoritama?

➡️ Oni su adaptivni, robusni i mogu da rade i kada podaci nisu savrseni ili su promenljivi.

---

## ❓ 5. Koji su glavni nedostaci?

➡️ Spori su, ne garantuju optimalno resenje i cesto ih je tesko objasniti.

---

## ❓ 6. Sta su evolucioni algoritmi?

➡️ To su algoritmi koji simuliraju prirodnu selekciju, gde se najbolja resenja zadrzavaju i unapredjuju kroz generacije.

---

## ❓ 7. Sta je selekcija u evoluciji?

➡️ Proces u kojem se biraju najbolja resenja (jedinke) koja ce ucestvovati u sledecoj iteraciji.

---

## ❓ 8. Sta je mutacija u algoritmima?

➡️ Nasumicna promena resenja koja uvodi raznovrsnost i pomaze da se izbegnu losa lokalna resenja.

---

## ❓ 9. Sta je ukrstanje (crossover)?

➡️ Kombinovanje dva resenja kako bi se dobilo novo, potencijalno bolje resenje.

---

## ❓ 10. Sta je swarm inteligencija?

➡️ To je pristup inspirisan ponasanjem rojeva (npr. mravi, ptice), gde jednostavne jedinke zajedno dolaze do slozenog resenja.

---

## ❓ 11. Sta su imuni algoritmi?

➡️ Algoritmi inspirisani ljudskim imunim sistemom, koji prepoznaju i “eliminuju” losa resenja.

---

## ❓ 12. Zasto ovi algoritmi ne garantuju optimalno resenje?

➡️ Zato sto pretrazuju prostor resenja heuristicki (priblizno), a ne iscrpno, pa mogu da nadju dobro, ali ne i najbolje resenje.

---

## ❓ 13. Sta znaci da su pogodni za kompleksne probleme?

➡️ Znaci da mogu da rese probleme sa mnogo promenljivih i ogranicenja, gde klasicne metode ne rade dobro.

---

## ❓ 14. Zasto su ovi algoritmi robusni?

➡️ Zato sto mogu da rade i sa nepotpunim ili nepreciznim podacima bez velikog pada performansi.

---

## ❓ 15. Ekosistemski modeli (Ecosystem-based algorithms)

➡️ Osnovna ideja:
Inspirisani su prirodnim ekosistemima gde vise vrsta (populacija) medjusobno interaguje – saradjuju, takmice se ili zavise jedna od druge (predator–plen, konkurencija, simbioza).

---

## ❓ 16. Simulated Annealing (SA)

➡️ Inspirisan procesom hladjenja metala, gde se materijal polako hladi da bi dostigao stabilno (optimalno) stanje.

---

# 🎯 Kratak rezime za pamcenje

- Inspiracija = priroda
- Tipovi = evolucija, roj, imuni sistem
- Prednosti = fleksibilnost
- Mane = sporost, nema garancije

---

# 🗣️ Tema 5 – Speech and Language Processing (NLP)

---

## ❓ 1. Sta je Speech and Language Processing?

➡️ To je oblast koja kombinuje racunarstvo, lingvistiku i AI kako bi omogucila racunarima da razumeju, analiziraju i generisu ljudski jezik (tekst i govor).

---

## ❓ 2. Sta je NLP (Natural Language Processing)?

➡️ NLP je deo AI koji se bavi obradom i razumevanjem prirodnog jezika, odnosno komunikacijom izmedju ljudi i racunara.

---

## ❓ 3. Koji su glavni zadaci NLP-a?

➡️ Najcesci zadaci su analiza teksta, klasifikacija (npr. sentiment analiza), prevod, ekstrakcija informacija i chatbot sistemi.

---

## ❓ 4. Sta je tokenizacija?

➡️ Tokenizacija je proces razdvajanja teksta na manje jedinice, najcesce reci ili tokene, kako bi model mogao da ih obradi.

---

## ❓ 5. Sta je stemming i lemmatization?

➡️ To su tehnike koje svode reci na njihov osnovni oblik, gde stemming skracuje rec, a lemmatization koristi pravila jezika da dobije tacan osnovni oblik.

---

## ❓ 6. Sta su stop reci i zasto se uklanjaju?

➡️ Stop reci su ceste reci (npr. “i”, “je”, “da”) koje ne nose znacajnu informaciju, pa se uklanjaju da bi model bio efikasniji.

---

## ❓ 7. Sta je Part-of-Speech (POS) tagging?

➡️ To je proces oznacavanja svake reci njenom vrstom (imenica, glagol, pridev), sto pomaze u razumevanju strukture recenice.

---

## ❓ 8. Sta je Named Entity Recognition (NER)?

➡️ NER je tehnika koja prepoznaje konkretne entitete u tekstu, kao sto su imena ljudi, mesta, organizacije ili datumi.

---

## ❓ 9. Sta je semanticka analiza?

➡️ Semanticka analiza se bavi razumevanjem znacenja teksta, odnosno konteksta i odnosa izmedju reci.

---

## ❓ 10. Sta je ekstrakcija informacija?

➡️ To je proces izdvajanja bitnih informacija iz teksta, kao sto su entiteti i odnosi izmedju njih.

---

## ❓ 11. Sta je sentiment analiza?

➡️ To je zadatak klasifikacije teksta prema emociji ili stavu (pozitivan, negativan, neutralan).

---

## ❓ 12. Koje su najcesce primene NLP-a?

➡️ Chatbotovi, prevodioci, preporuke, analiza komentara, spam filteri i prepoznavanje govora.

---

## ❓ 13. Koja je razlika izmedju sintakse i semantike?

➡️ Sintaksa se bavi strukturom recenice, dok se semantika bavi njenim znacenjem.

---

## ❓ 14. Zasto je NLP kompleksan problem?

➡️ Zato sto je ljudski jezik neprecizan, ima mnogo znacenja i zavisi od konteksta.

---

## ❓ 15. Kako se tekst pretvara u oblik pogodan za model?

➡️ Tekst se pretvara u numericki oblik (vektore) kako bi ga model mogao obraditi.

---

# 🎯 Kratak rezime za pamcenje

- NLP = rad sa tekstom i govorom
- Tokenizacija → osnovni korak
- NER → entiteti
- Sentiment → emocija
- Sintaksa vs semantika

---

# 👁️ Tema 6 – Computer Vision

---

## ❓ 1. Sta je Computer Vision?

➡️ Computer Vision je oblast AI koja omogucava racunarima da “vide”, odnosno da analiziraju i razumeju slike i video zapise.

---

## ❓ 2. Koji je osnovni cilj Computer Vision-a?

➡️ Cilj je da racunar iz slike izvuce korisne informacije, slicno kao sto to radi covek kada gleda sliku.

---

## ❓ 3. Sta je image classification?

➡️ To je zadatak gde model odredjuje kojoj kategoriji pripada cela slika (npr. pas, auto, covek).

---

## ❓ 4. Sta je object detection?

➡️ To je slozeniji zadatak gde model ne samo da prepoznaje objekat, vec i odredjuje gde se on nalazi na slici.

---

## ❓ 5. Sta je object tracking?

➡️ To je pracenje objekta kroz video, gde model prati njegovo kretanje kroz vise frejmova.

---

## ❓ 6. Sta je content-based image retrieval?

➡️ To je pronalazenje slicnih slika na osnovu njihovog sadrzaja, a ne na osnovu imena ili tagova.

---

## ❓ 7. Koje su najcesce primene Computer Vision-a?

➡️ Prepoznavanje lica, autonomna vozila, medicinska analiza slika i sigurnosni sistemi.

---

## ❓ 8. Koji su izazovi u Computer Vision-u?

➡️ Razlicito osvetljenje, uglovi, kvalitet slike i kompleksnost scene mogu otežati prepoznavanje objekata.

---

## ❓ 9. Kako racunar “vidi” sliku?

➡️ Slika se predstavlja kao matrica brojeva (pikseli), koje model koristi za analizu.

---

## ❓ 10. Koja je razlika izmedju klasifikacije i detekcije?

➡️ Klasifikacija daje jednu klasu za celu sliku, dok detekcija pronalazi vise objekata i njihovu poziciju.

---

## ❓ 11. Kako se treniraju modeli za Computer Vision?

➡️ Modeli se treniraju na velikim skupovima slika koje su oznacene (labelovane).

---

## ❓ 12. Koji su alati i biblioteke za Computer Vision?

➡️ Najcesce se koriste OpenCV, TensorFlow i PyTorch.

---

## ❓ 13. Zasto je potrebna velika kolicina podataka?

➡️ Zato sto model mora da nauci razlicite varijacije objekata kako bi bio pouzdan.

---

## ❓ 14. Sta znaci generalizacija u Computer Vision-u?

➡️ To znaci da model moze da prepozna objekat i na novim slikama koje nije video tokom treniranja.

---

# 🎯 Kratak rezime za pamcenje

- CV = rad sa slikama
- Classification → sta je na slici
- Detection → gde je objekat
- Tracking → kretanje
- Slika = matrica piksela

---

# 🧠 Tema 7 – AI Planning (Automatsko planiranje)

---

## ❓ 1. Sta je automated planning?

➡️ Automated planning je oblast AI koja se bavi pronalazenjem niza akcija koje vode od pocetnog stanja do zeljenog cilja.

---

## ❓ 2. Sta je plan u AI?

➡️ Plan je konkretan redosled akcija koje sistem treba da izvrsi da bi dosao do ciljnog stanja.

---

## ❓ 3. Sta je stanje (state)?

➡️ Stanje predstavlja trenutnu situaciju sistema, odnosno sve relevantne informacije u tom trenutku.

---

## ❓ 4. Sta je state space (prostor stanja)?

➡️ State space je skup svih mogucih stanja kroz koja sistem moze da prodje.

---

## ❓ 5. Sta su inicijalno i ciljno stanje?

➡️ Inicijalno stanje je pocetna pozicija problema, dok je ciljno stanje ono koje zelimo da postignemo.

---

## ❓ 6. Sta je problem planiranja?

➡️ Problem planiranja je pronaci sekvencu akcija koja vodi od pocetnog do ciljnog stanja.

---

## ❓ 7. Koja je razlika izmedju optimalnog i suboptimalnog planiranja?

➡️ Optimalno planiranje pronalazi najbolje resenje (najmanji trosak), dok suboptimalno pronalazi dovoljno dobro resenje brze.

---

## ❓ 8. Sta znaci deterministicko okruzenje?

➡️ To je okruzenje gde svaka akcija ima predvidiv i siguran rezultat.

---

## ❓ 9. Sta je stohasticko (nedeterministicko) okruzenje?

➡️ To je okruzenje gde akcije mogu imati razlicite ishode, pa postoji neizvesnost.

---

## ❓ 10. Sta znaci potpuno vs nepotpuno vidljivo okruzenje?

➡️ Potpuno vidljivo znaci da agent ima sve informacije o stanju, dok nepotpuno znaci da vidi samo deo informacija.

---

## ❓ 11. Sta je single-agent vs multi-agent sistem?

➡️ Single-agent ima jednog aktera, dok multi-agent ukljucuje vise agenata koji mogu saradjivati ili konkurisati.

---

## ❓ 12. Sta je heuristika u planiranju?

➡️ Heuristika je pravilo ili procena koja pomaze da se brze pronadje resenje bez pretrage svih mogucnosti.

---

## ❓ 13. Sta je apstrakcija u planiranju?

➡️ Apstrakcija pojednostavljuje problem tako sto ignorise nebitne detalje i fokusira se na kljucne elemente.

---

## ❓ 14. Zasto je planiranje vazno u AI?

➡️ Zato sto omogucava sistemima da donose odluke i planiraju akcije unapred u kompleksnim situacijama.

---

# 🎯 Kratak rezime za pamcenje

- Planning = niz akcija
- State = trenutno stanje
- State space = sva stanja
- Heuristika = ubrzanje resavanja
- Optimalno vs suboptimalno

---

# 🧠 Tema 8 – Deep Learning u NLP

---

## ❓ 1. Sta je uloga Deep Learning-a u NLP-u?

➡️ Deep Learning omogucava modelima da automatski uce obrasce iz teksta bez potrebe za rucnim definisanjem pravila ili feature-a.

---

## ❓ 2. Sta je reprezentacija teksta u NLP-u?

➡️ To je nacin na koji se tekst pretvara u numericki oblik (vektore) kako bi ga racunar mogao obraditi.

---

## ❓ 3. Sta je one-hot encoding i koji je problem?

➡️ One-hot predstavlja svaku rec kao veliki vektor sa jednom jedinicom, ali ne hvata znacenje reci niti slicnosti izmedju njih.

---

## ❓ 4. Sta su word embeddings?

➡️ Embeddings su gusti numericki vektori koji predstavljaju reci tako da slicne reci imaju slicne reprezentacije.

---

## ❓ 5. Sta je sequence classification?

➡️ To je zadatak gde se cela sekvenca (recenica ili tekst) klasifikuje u neku kategoriju, npr. sentiment analiza.

---

## ❓ 6. Sta je pairwise sequence classification?

➡️ To je uporedjivanje dve sekvence kako bi se utvrdilo da li imaju isto znacenje ili su slicne.

---

## ❓ 7. Sta je word labeling?

➡️ To je oznacavanje svake reci u tekstu nekom kategorijom, npr. NER ili POS tagging.

---

## ❓ 8. Sta su seq2seq modeli?

➡️ To su modeli koji primaju jednu sekvencu kao ulaz i generisu drugu sekvencu kao izlaz, npr. prevod teksta.

---

## ❓ 9. Zasto su neuronske mreze efikasne u NLP-u?

➡️ Zato sto mogu da obrade velike kolicine podataka i nauce kompleksne obrasce i odnose izmedju reci.

---

## ❓ 10. Koji su izazovi deep learning-a u NLP-u?

➡️ Potrebna je velika kolicina podataka, visoki racunarski resursi i modeli su cesto teski za interpretaciju.

---

## ❓ 11. Sta su transformer modeli?

➡️ To su moderni DL modeli koji koriste attention mehanizam da bolje razumeju kontekst u tekstu.

---

## ❓ 12. Zasto DL modeli cesto zamenjuju tradicionalne metode?

➡️ Zato sto daju bolje performanse i ne zahtevaju rucno pravljenje feature-a.

---

## ❓ 13. Koji su nedostaci DL pristupa u NLP-u?

➡️ Tesko ih je objasniti (black-box), zahtevaju puno resursa i mogu imati bias iz podataka.

---

## ❓ 14. Sta znaci da model “razume kontekst”?

➡️ To znaci da model uzima u obzir okruzenje reci u recenici kako bi pravilno interpretirao znacenje.

---

# 🎯 Kratak rezime za pamcenje

- One-hot ❌ nema znacenje
- Embeddings ✔ imaju znacenje
- Seq2seq = ulaz → izlaz tekst
- DL = automatsko ucenje feature-a
- Transformer = kontekst

---

# 🧩 Tema 9 – Identitet AI (teorijski pogled)

---

## ❓ 1. Zasto je tesko definisati AI?

➡️ Zato sto se AI stalno razvija i obuhvata vise oblasti (ML, statistika, data science), pa nema jedinstvenu i preciznu definiciju.

---

## ❓ 2. Sta se podrazumeva pod “identitetom AI”?

➡️ Identitet AI predstavlja skup karakteristika, osobina i oblasti koje zajedno opisuju sta AI jeste i kako se razlikuje od drugih disciplina.

---

## ❓ 3. Koje oblasti se preklapaju sa AI?

➡️ AI se preklapa sa data science-om, statistikom, kognitivnim naukama, softverskim inzenjerstvom i mnogim drugim oblastima.

---

## ❓ 4. Sta znaci autonomno ponasanje AI sistema?

➡️ To znaci da sistem moze samostalno donositi odluke bez direktne kontrole coveka, na osnovu naucenih obrazaca.

---

## ❓ 5. Sta je explainability (objasnjivost)?

➡️ Explainability oznacava koliko lako mozemo razumeti kako i zasto je AI model doneo neku odluku.

---

## ❓ 6. Zasto je explainability vazna?

➡️ Vazna je jer korisnici i eksperti moraju imati poverenje u sistem i razumeti njegove odluke.

---

## ❓ 7. Sta je bias u AI sistemima?

➡️ Bias je pristrasnost modela koja nastaje zbog neuravnotezenih ili pogresnih podataka.

---

## ❓ 8. Sta znaci trustworthiness (pouzdanost)?

➡️ To znaci da je AI sistem siguran, fer i pouzdan za koriscenje u realnim situacijama.

---

## ❓ 9. Ko su stakeholders u AI?

➡️ To su svi koji imaju interes u sistemu: korisnici, developeri, kompanije i drustvo u celini.

---

## ❓ 10. Kako se AI menja kroz vreme?

➡️ AI se stalno razvija kroz nove algoritme, vise podataka i bolje racunarske resurse.

---

## ❓ 11. Koji su glavni izazovi moderne AI?

➡️ Interpretabilnost, bias, etika, potrosnja resursa i sigurnost sistema.

---

## ❓ 12. Zasto kazemo da je AI interdisciplinaran?

➡️ Zato sto ukljucuje znanja iz vise oblasti, kao sto su matematika, informatika, lingvistika i psihologija.

---

## ❓ 13. Kako AI utice na drustvo?

➡️ AI menja nacin rada, automatizuje procese i donosi nove mogucnosti, ali i izazove.

---

## ❓ 14. Zasto se granice AI stalno pomeraju?

➡️ Zato sto nove tehnologije i ideje stalno prosiruju ono sto smatramo AI-jem.

---
