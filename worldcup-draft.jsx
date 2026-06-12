import { useState, useRef, useCallback, useEffect } from "react";

const FORMATIONS = ["4-3-3","4-4-2","4-2-3-1","3-5-2","3-4-3","5-3-2","4-5-1"];
const FORMATION_LAYOUT = {
  "4-3-3":  [{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"CM",r:2,c:.2},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.8},{pos:"LW",r:3,c:.1},{pos:"ST",r:3,c:.5},{pos:"RW",r:3,c:.9}],
  "4-4-2":  [{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"LM",r:2,c:.1},{pos:"CM",r:2,c:.37},{pos:"CM",r:2,c:.63},{pos:"RM",r:2,c:.9},{pos:"ST",r:3,c:.35},{pos:"ST",r:3,c:.65}],
  "4-2-3-1":[{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"CDM",r:2,c:.35},{pos:"CDM",r:2,c:.65},{pos:"LW",r:3,c:.1},{pos:"CAM",r:3,c:.5},{pos:"RW",r:3,c:.9},{pos:"ST",r:4,c:.5}],
  "3-5-2":  [{pos:"GK",r:0,c:.5},{pos:"CB",r:1,c:.2},{pos:"CB",r:1,c:.5},{pos:"CB",r:1,c:.8},{pos:"LWB",r:2,c:.05},{pos:"CM",r:2,c:.3},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.7},{pos:"RWB",r:2,c:.95},{pos:"ST",r:3,c:.35},{pos:"ST",r:3,c:.65}],
  "3-4-3":  [{pos:"GK",r:0,c:.5},{pos:"CB",r:1,c:.2},{pos:"CB",r:1,c:.5},{pos:"CB",r:1,c:.8},{pos:"LM",r:2,c:.1},{pos:"CM",r:2,c:.37},{pos:"CM",r:2,c:.63},{pos:"RM",r:2,c:.9},{pos:"LW",r:3,c:.1},{pos:"ST",r:3,c:.5},{pos:"RW",r:3,c:.9}],
  "5-3-2":  [{pos:"GK",r:0,c:.5},{pos:"LWB",r:1,c:.05},{pos:"CB",r:1,c:.27},{pos:"CB",r:1,c:.5},{pos:"CB",r:1,c:.73},{pos:"RWB",r:1,c:.95},{pos:"CM",r:2,c:.2},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.8},{pos:"ST",r:3,c:.35},{pos:"ST",r:3,c:.65}],
  "4-5-1":  [{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"LM",r:2,c:.05},{pos:"CM",r:2,c:.27},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.73},{pos:"RM",r:2,c:.95},{pos:"ST",r:3,c:.5}],
};

// Full 23-man squads. Each player: name, pos[], rating
const NP = {
 "Brazil":[
  ,
  {y:2018,p:[
  {n:"Alisson",pos:["GK"],r:88},
  {n:"Ederson",pos:["GK"],r:84},
  {n:"Cassio",pos:["GK"],r:79},
  {n:"Danilo",pos:["RB","RWB"],r:80},
  {n:"Fagner",pos:["RB","RWB"],r:76},
  {n:"Miranda",pos:["CB"],r:82},
  {n:"Marquinhos",pos:["CB","CDM"],r:86},
  {n:"Pedro Geromel",pos:["CB"],r:76},
  {n:"Thiago Silva",pos:["CB"],r:88},
  {n:"Filipe Luis",pos:["LB","LWB"],r:83},
  {n:"Marcelo",pos:["LB","LWB"],r:85},
  {n:"Casemiro",pos:["CDM","CM"],r:87},
  {n:"Fernandinho",pos:["CDM","CM"],r:82},
  {n:"Paulinho",pos:["CM","CDM"],r:80},
  {n:"Renato Augusto",pos:["CM","CAM"],r:79},
  {n:"Philippe Coutinho",pos:["CAM","LW","CM"],r:88},
  {n:"Willian",pos:["RW","LW"],r:81},
  {n:"Douglas Costa",pos:["RW","LW"],r:80},
  {n:"Taison",pos:["LW","RW"],r:75},
  {n:"Neymar",pos:["LW","CAM","ST"],r:93},
  {n:"Roberto Firmino",pos:["ST","CAM"],r:85},
  {n:"Gabriel Jesus",pos:["ST","LW"],r:82},
  {n:"Fred",pos:["CDM","CM"],r:76}
 ]},
  {y:2022,p:[
  {n:"Alisson",pos:["GK"],r:91},
  {n:"Ederson",pos:["GK"],r:87},
  {n:"Weverton",pos:["GK"],r:78},
  {n:"Dani Alves",pos:["RB","RWB"],r:78},
  {n:"Danilo",pos:["RB","RWB","CB"],r:82},
  {n:"Eder Militao",pos:["CB"],r:85},
  {n:"Marquinhos",pos:["CB"],r:88},
  {n:"Thiago Silva",pos:["CB"],r:86},
  {n:"Bremer",pos:["CB"],r:83},
  {n:"Alex Sandro",pos:["LB","LWB"],r:79},
  {n:"Alex Telles",pos:["LB","LWB"],r:78},
  {n:"Casemiro",pos:["CDM","CM"],r:88},
  {n:"Fabinho",pos:["CDM","CM"],r:85},
  {n:"Bruno Guimaraes",pos:["CM","CDM"],r:83},
  {n:"Fred",pos:["CDM","CM"],r:74},
  {n:"Lucas Paqueta",pos:["CM","CAM"],r:84},
  {n:"Everton Ribeiro",pos:["CM","CAM","RW"],r:77},
  {n:"Neymar",pos:["LW","CAM","ST"],r:91},
  {n:"Vinicius Junior",pos:["LW","ST"],r:90},
  {n:"Raphinha",pos:["RW","LW"],r:84},
  {n:"Antony",pos:["RW","LW"],r:79},
  {n:"Rodrygo",pos:["LW","RW","ST"],r:82},
  {n:"Gabriel Martinelli",pos:["LW","ST"],r:82},
  {n:"Gabriel Jesus",pos:["ST","LW"],r:82},
  {n:"Richarlison",pos:["ST","LW"],r:83},
  {n:"Pedro",pos:["ST"],r:78}
 ]},
  {y:2006,p:[
  {n:"Dida",pos:["GK"],r:85},{n:"Júlio César",pos:["GK"],r:82},{n:"Rogério Ceni",pos:["GK"],r:78},
  {n:"Cafu",pos:["RB","RWB"],r:83},{n:"Cicinho",pos:["RB","RWB"],r:77},
  {n:"Lúcio",pos:["CB"],r:85},{n:"Juan",pos:["CB"],r:79},{n:"Luisão",pos:["CB"],r:80},
  {n:"Cris",pos:["CB"],r:79},{n:"Roberto Carlos",pos:["LB","LWB"],r:85},
  {n:"Gilberto Silva",pos:["CDM","CM"],r:82},{n:"Emerson",pos:["CDM","CM"],r:80},
  {n:"Gilberto",pos:["CM","CDM"],r:75},{n:"Mineiro",pos:["CDM","CM"],r:74},
  {n:"Ricardinho",pos:["CM","CDM"],r:73},{n:"Juninho Pernambucano",pos:["CM","CAM"],r:83},
  {n:"Zé Roberto",pos:["LW","LB","CM"],r:80},{n:"Kaká",pos:["CAM","CM"],r:90},
  {n:"Ronaldinho",pos:["CAM","LW"],r:94},{n:"Robinho",pos:["LW","RW"],r:82},
  {n:"Adriano",pos:["ST","LW"],r:85},{n:"Fred",pos:["ST"],r:76},{n:"Ronaldo",pos:["ST"],r:89}
 ]},
  {y:2010,p:[
  {n:"Júlio César",pos:["GK"],r:86},{n:"Doni",pos:["GK"],r:77},{n:"Heurelho Gomes",pos:["GK"],r:78},
  {n:"Dani Alves",pos:["RB","RWB"],r:87},{n:"Maicon",pos:["RB","RWB"],r:86},
  {n:"Lúcio",pos:["CB"],r:83},{n:"Juan",pos:["CB"],r:77},{n:"Luisão",pos:["CB"],r:79},
  {n:"Gilberto",pos:["CM","LB"],r:74},{n:"Gilberto Silva",pos:["CDM","CM"],r:80},
  {n:"Júlio Baptista",pos:["CM","ST"],r:76},{n:"Felipe Melo",pos:["CDM","CM"],r:78},
  {n:"Kléberson",pos:["CM","CDM"],r:73},{n:"Josué",pos:["CM","CDM"],r:74},
  {n:"Ramires",pos:["CM","CDM"],r:79},{n:"Michel Bastos",pos:["LW","CM"],r:79},
  {n:"Elano",pos:["CAM","CM","LW"],r:78},{n:"Kaká",pos:["CAM","CM"],r:88},
  {n:"Robinho",pos:["LW","ST"],r:81},{n:"Nilmar",pos:["ST","LW"],r:75},
  {n:"Thiago Silva",pos:["CB"],r:84},{n:"Luís Fabiano",pos:["ST"],r:82},
  {n:"Grafite",pos:["ST"],r:74}
 ]},
  {y:2014,p:[
  {n:"Júlio César",pos:["GK"],r:82},{n:"Victor",pos:["GK"],r:76},{n:"Jefferson",pos:["GK"],r:75},
  {n:"Dani Alves",pos:["RB","RWB"],r:87},{n:"Maicon",pos:["RB","CB"],r:79},
  {n:"David Luiz",pos:["CB","CDM"],r:85},{n:"Dante",pos:["CB"],r:79},
  {n:"Thiago Silva",pos:["CB"],r:88},{n:"Henrique",pos:["CB","LB"],r:72},
  {n:"Maxwell",pos:["LB","LWB"],r:76},{n:"Marcelo",pos:["LB","LWB"],r:87},
  {n:"Fernandinho",pos:["CDM","CM"],r:81},{n:"Luiz Gustavo",pos:["CDM","CM"],r:80},
  {n:"Paulinho",pos:["CM","CDM"],r:78},{n:"Ramires",pos:["CM","CDM"],r:78},
  {n:"Hernanes",pos:["CAM","CM"],r:78},{n:"Oscar",pos:["CAM","CM"],r:82},
  {n:"Bernard",pos:["LW","RW"],r:77},{n:"Willian",pos:["RW","LW"],r:78},
  {n:"Hulk",pos:["LW","ST"],r:79},{n:"Jô",pos:["ST"],r:72},
  {n:"Fred",pos:["ST"],r:77},{n:"Neymar",pos:["LW","ST","CAM"],r:91}
 ]},
  {y:1994,p:[
  {n:"Cláudio Taffarel",pos:["GK"],r:86},{n:"Zetti",pos:["GK"],r:76},{n:"Gilmar Rinaldi",pos:["GK"],r:73},
  {n:"Cafu",pos:["RB","RWB"],r:85},{n:"Márcio Santos",pos:["CB"],r:79},
  {n:"Aldair",pos:["CB"],r:83},{n:"Ricardo Rocha",pos:["CB"],r:77},
  {n:"Ronaldão",pos:["CB"],r:75},{n:"Branco",pos:["LB","LWB"],r:80},
  {n:"Jorginho",pos:["RB","CDM"],r:78},{n:"Mauro Silva",pos:["CDM","CM"],r:78},
  {n:"Mazinho",pos:["CDM","CM"],r:76},{n:"Dunga",pos:["CM","CDM"],r:82},
  {n:"Zinho",pos:["CM","CAM"],r:82},{n:"Paulo Sérgio",pos:["LW","CM"],r:74},
  {n:"Viola",pos:["CM","LW"],r:72},{n:"Raí",pos:["CAM","CM"],r:81},
  {n:"Leonardo",pos:["LB","LW"],r:81},{n:"Bebeto",pos:["ST","LW"],r:90},
  {n:"Müller",pos:["ST","LW"],r:77},{n:"Romário",pos:["ST"],r:93},
  {n:"Ronaldo",pos:["ST","LW"],r:78}
 ]},
  {y:1998,p:[
  {n:"Cláudio Taffarel",pos:["GK"],r:84},{n:"Dida",pos:["GK"],r:78},{n:"Carlos Germano",pos:["GK"],r:74},
  {n:"Cafu",pos:["RB","RWB"],r:87},{n:"Aldair",pos:["CB"],r:83},
  {n:"Júnior Baiano",pos:["CB"],r:76},{n:"André Cruz",pos:["CB"],r:74},
  {n:"Roberto Carlos",pos:["LB","LWB"],r:88},{n:"Zé Carlos",pos:["LB","CB"],r:73},
  {n:"César Sampaio",pos:["CDM","CM"],r:77},{n:"Dunga",pos:["CM","CDM"],r:79},
  {n:"Emerson",pos:["CDM","CM"],r:76},{n:"Doriva",pos:["CM","CDM"],r:72},
  {n:"Kléberson",pos:["CM","CDM"],r:73},{n:"Gonçalves",pos:["CM","LW"],r:71},
  {n:"Leonardo",pos:["LB","LW"],r:79},{n:"Denílson",pos:["LW","CAM"],r:77},
  {n:"Zé Roberto",pos:["LW","LB","CM"],r:78},{n:"Giovanni",pos:["LW","CAM"],r:77},
  {n:"Edmundo",pos:["ST","LW"],r:79},{n:"Bebeto",pos:["ST","LW"],r:86},
  {n:"Rivaldo",pos:["LW","CAM"],r:91},{n:"Ronaldo",pos:["ST"],r:97}
 ]},
  {y:2002,p:[
  {n:"Marcos",pos:["GK"],r:82},{n:"Dida",pos:["GK"],r:82},{n:"Rogério Ceni",pos:["GK"],r:77},
  {n:"Cafu",pos:["RB","RWB"],r:87},{n:"Lúcio",pos:["CB"],r:84},
  {n:"Roque Júnior",pos:["CB"],r:77},{n:"Ânderson Polga",pos:["CB"],r:73},
  {n:"Roberto Carlos",pos:["LB","LWB"],r:88},{n:"Juliano Belletti",pos:["RB","LB"],r:76},
  {n:"Gilberto Silva",pos:["CDM","CM"],r:81},{n:"Kléberson",pos:["CM","CDM"],r:76},
  {n:"Edmílson",pos:["CDM","CM"],r:77},{n:"Vampeta",pos:["CDM","CM"],r:73},
  {n:"Ricardinho",pos:["CDM","CM"],r:72},{n:"Júnior",pos:["LB","CM"],r:74},
  {n:"Edílson",pos:["LW","CM"],r:74},{n:"Juninho Paulista",pos:["CM","CAM"],r:76},
  {n:"Denílson",pos:["LW","CAM"],r:75},{n:"Luizão",pos:["ST"],r:75},
  {n:"Rivaldo",pos:["LW","CAM"],r:90},{n:"Kaká",pos:["CAM","CM"],r:81},
  {n:"Ronaldinho",pos:["LW","CAM"],r:86},{n:"Ronaldo",pos:["ST"],r:96}
 ]},
  {y:1982,p:[
  {n:"Waldir Peres",pos:["GK"],r:79},{n:"Leandro",pos:["RB","RWB"],r:79},
  {n:"Oscar",pos:["CB"],r:78},{n:"Luizinho",pos:["CB"],r:76},
  {n:"Júnior",pos:["LB","LWB"],r:82},{n:"Éder",pos:["LW","ST"],r:81},
  {n:"Batista",pos:["CDM","CM"],r:77},{n:"Falcão",pos:["CM","CDM"],r:88},
  {n:"Toninho Cerezo",pos:["CM","CDM"],r:82},{n:"Paulo Sérgio",pos:["CM","LW"],r:72},
  {n:"Paulo Isidoro",pos:["CM","LW"],r:72},{n:"Renato",pos:["CM","CAM"],r:74},
  {n:"Pedrinho",pos:["CM","LW"],r:70},{n:"Dirceu",pos:["CAM","CM"],r:80},
  {n:"Serginho",pos:["LW","ST"],r:72},{n:"Edinho",pos:["CDM","CM"],r:75},
  {n:"Carlos",pos:["LB","CDM"],r:73},{n:"Roberto Dinamite",pos:["ST"],r:77},
  {n:"Paulo Sérgio",pos:["LW","ST"],r:72},{n:"Sócrates",pos:["CAM","CM"],r:88},
  {n:"Zico",pos:["CAM","CM"],r:94}
 ]},
  {y:1986,p:[
  {n:"Leão",pos:["GK"],r:79},{n:"Júlio César",pos:["GK"],r:77},{n:"Carlos",pos:["GK"],r:72},
  {n:"Josimar",pos:["RB","RWB"],r:78},{n:"Mauro Galvão",pos:["CB"],r:76},
  {n:"Oscar",pos:["CB"],r:76},{n:"Edinho",pos:["CB","CDM"],r:73},
  {n:"Júnior",pos:["LB","LWB"],r:80},{n:"Branco",pos:["LB","LWB"],r:79},
  {n:"Elzo",pos:["CDM","CM"],r:72},{n:"Paulo Silas",pos:["CDM","CM"],r:73},
  {n:"Alemão",pos:["CM","CDM"],r:76},{n:"Paulo Vítor",pos:["CM"],r:70},
  {n:"Valdo",pos:["CM","CAM"],r:77},{n:"Casagrande",pos:["LW","ST"],r:72},
  {n:"Edivaldo",pos:["LW","CM"],r:70},{n:"Müller",pos:["LW","ST"],r:77},
  {n:"Falcão",pos:["CM","CAM"],r:84},{n:"Sócrates",pos:["CAM","CM"],r:85},
  {n:"Zico",pos:["CAM","CM"],r:90},{n:"Careca",pos:["ST"],r:84},
  {n:"Édson",pos:["LW","ST"],r:72}
 ]},
  {y:1990,p:[
  {n:"Cláudio Taffarel",pos:["GK"],r:84},{n:"Acácio",pos:["GK"],r:72},{n:"Zé Carlos",pos:["GK"],r:71},
  {n:"Jorginho",pos:["RB","RWB"],r:78},{n:"Ricardo Rocha",pos:["CB"],r:76},
  {n:"Aldair",pos:["CB"],r:80},{n:"Mauro Galvão",pos:["CB"],r:74},
  {n:"Carlos Mozer",pos:["CB"],r:73},{n:"Ricardo Gomes",pos:["CB","CDM"],r:73},
  {n:"Branco",pos:["LB","LWB"],r:80},{n:"Dunga",pos:["CM","CDM"],r:81},
  {n:"Mazinho",pos:["CDM","CM"],r:75},{n:"Alemão",pos:["CM","CDM"],r:75},
  {n:"Paulo Silas",pos:["CDM","CM"],r:72},{n:"Valdo",pos:["CM","CAM"],r:77},
  {n:"Bismarck",pos:["CM","LW"],r:73},{n:"Renato Gaúcho",pos:["LW","CAM"],r:75},
  {n:"Paulo Silas",pos:["CM","CDM"],r:72},{n:"Tita",pos:["LW","ST"],r:71},
  {n:"Müller",pos:["LW","ST"],r:78},{n:"Bebeto",pos:["ST","LW"],r:86},
  {n:"Romário",pos:["ST"],r:89},{n:"Careca",pos:["ST"],r:85}
 ]},
  {y:1970,p:[
  {n:"Félix",pos:["GK"],r:79},{n:"Leão",pos:["GK"],r:77},{n:"Baldocchi",pos:["GK"],r:70},
  {n:"Carlos Alberto",pos:["RB","RWB"],r:88},{n:"Brito",pos:["CB"],r:80},
  {n:"Piazza",pos:["CB","CDM"],r:76},{n:"Fontana",pos:["CB"],r:73},
  {n:"Everaldo",pos:["LB","LWB"],r:79},{n:"Marco Antônio",pos:["LB","LWB"],r:75},
  {n:"Clodoaldo",pos:["CDM","CM"],r:81},{n:"Gérson",pos:["CM","CAM"],r:86},
  {n:"Roberto",pos:["CDM","CM"],r:73},{n:"Joel",pos:["CM","CDM"],r:72},
  {n:"Edu",pos:["LW","CM"],r:76},{n:"Caju",pos:["LW","CM"],r:75},
  {n:"Zé Maria",pos:["RB","CDM"],r:75},{n:"Rivellino",pos:["LW","CAM"],r:88},
  {n:"Dario",pos:["LW","ST"],r:72},{n:"Ado",pos:["CM","LW"],r:71},
  {n:"Tostão",pos:["ST","CAM"],r:87},{n:"Jairzinho",pos:["RW","LW"],r:90},
  {n:"Pelé",pos:["ST","CAM"],r:99}
 ]},
  {y:1974,p:[
  {n:"Leão",pos:["GK"],r:82},{n:"Waldir Peres",pos:["GK"],r:75},{n:"Raul",pos:["GK"],r:70},
  {n:"Zé Maria",pos:["RB","RWB"],r:76},{n:"Luís Pereira",pos:["CB"],r:79},
  {n:"Piazza",pos:["CB","CDM"],r:75},{n:"Marinho Peres",pos:["CB"],r:74},
  {n:"Marco Antônio",pos:["LB","LWB"],r:74},{n:"Alfredo",pos:["LB","CB"],r:70},
  {n:"Carpegiani",pos:["CDM","CM"],r:76},{n:"Rivellino",pos:["LW","CAM"],r:86},
  {n:"Ademir da Guia",pos:["CM","CAM"],r:77},{n:"Renato",pos:["CM","CDM"],r:72},
  {n:"Marinho Chagas",pos:["LW","CM"],r:73},{n:"Valdomiro",pos:["LW","CM"],r:73},
  {n:"Edu",pos:["LW","CM"],r:74},{n:"Leivinha",pos:["LW","CAM"],r:75},
  {n:"César",pos:["CM","CDM"],r:72},{n:"Mirandinha",pos:["LW","ST"],r:72},
  {n:"Nelinho",pos:["RB","CDM"],r:76},{n:"Jairzinho",pos:["RW","LW"],r:87},
  {n:"Caju",pos:["LW","CM"],r:74},{n:"Dirceu",pos:["CAM","LW"],r:82}
 ]},
  {y:1978,p:[
  {n:"Leão",pos:["GK"],r:83},{n:"Waldir Peres",pos:["GK"],r:76},{n:"Carlos",pos:["GK"],r:71},
  {n:"Nelinho",pos:["RB","RWB"],r:77},{n:"Oscar",pos:["CB"],r:77},
  {n:"Amaral",pos:["CB"],r:75},{n:"Edinho",pos:["CB","CDM"],r:73},
  {n:"Abel",pos:["LB","LWB"],r:73},{n:"Rodrigues Neto",pos:["LB","CB"],r:71},
  {n:"Batista",pos:["CDM","CM"],r:76},{n:"Rivellino",pos:["LW","CAM"],r:84},
  {n:"Toninho Cerezo",pos:["CM","CDM"],r:79},{n:"Chicão",pos:["CB","CDM"],r:73},
  {n:"Gil",pos:["CM","CDM"],r:72},{n:"Toninho",pos:["CM","LW"],r:71},
  {n:"Polozzi",pos:["CM"],r:70},{n:"Dirceu",pos:["CAM","LW"],r:82},
  {n:"Zé Sérgio",pos:["LW","CM"],r:72},{n:"Jorge Mendonça",pos:["ST","LW"],r:72},
  {n:"Roberto Dinamite",pos:["ST"],r:78},{n:"Reinaldo",pos:["ST","LW"],r:77},
  {n:"Zico",pos:["CAM","CM"],r:92}
 ]},
  {y:1966,p:[
  {n:"Gilmar",pos:["GK"],r:84},{n:"Manga",pos:["GK"],r:76},{n:"Fidélis",pos:["GK"],r:70},
  {n:"Djalma Santos",pos:["RB","RWB"],r:81},{n:"Altair",pos:["CB"],r:74},
  {n:"Hilderaldo Bellini",pos:["CB"],r:77},{n:"Brito",pos:["CB"],r:76},
  {n:"Orlando",pos:["LB","LWB"],r:73},{n:"Rildo",pos:["LB","CB"],r:72},
  {n:"Zito",pos:["CDM","CM"],r:80},{n:"Lima",pos:["CM","CDM"],r:72},
  {n:"Silva",pos:["CM","CDM"],r:70},{n:"Gérson",pos:["CM","CAM"],r:86},
  {n:"Denílson",pos:["CM","CDM"],r:70},{n:"Paraná",pos:["LW","CM"],r:71},
  {n:"Paulo Henrique",pos:["LW","RW"],r:71},{n:"Edu",pos:["LW","CM"],r:73},
  {n:"Alcindo",pos:["LW","ST"],r:72},{n:"Garrincha",pos:["RW","LW"],r:88},
  {n:"Tostão",pos:["ST","CAM"],r:84},{n:"Jairzinho",pos:["RW","LW"],r:86},
  {n:"Pelé",pos:["ST","CAM"],r:99}
 ]}
 ],
 "Germany":[
  {y:2022,p:[
  {n:"Manuel Neuer",pos:["GK"],r:90},
  {n:"Marc-Andre ter Stegen",pos:["GK"],r:87},
  {n:"Kevin Trapp",pos:["GK"],r:79},
  {n:"Lukas Klostermann",pos:["RB","CB"],r:76},
  {n:"Niklas Sule",pos:["RB","CB"],r:83},
  {n:"Antonio Rudiger",pos:["CB"],r:86},
  {n:"Nico Schlotterbeck",pos:["CB"],r:80},
  {n:"Matthias Ginter",pos:["CB","RB"],r:79},
  {n:"Armel Bella-Kotchap",pos:["CB"],r:74},
  {n:"David Raum",pos:["LB","LWB"],r:79},
  {n:"Christian Gunter",pos:["LB"],r:74},
  {n:"Thilo Kehrer",pos:["CB","RB"],r:76},
  {n:"Joshua Kimmich",pos:["CDM","CM","RB"],r:91},
  {n:"Leon Goretzka",pos:["CM","CDM"],r:84},
  {n:"Ilkay Gundogan",pos:["CM","CAM","CDM"],r:85},
  {n:"Mario Gotze",pos:["CAM","LW","ST"],r:77},
  {n:"Jonas Hofmann",pos:["RW","CM"],r:78},
  {n:"Julian Brandt",pos:["CAM","LW","CM"],r:80},
  {n:"Serge Gnabry",pos:["RW","LW"],r:85},
  {n:"Leroy Sane",pos:["LW","RW"],r:86},
  {n:"Jamal Musiala",pos:["CAM","LW","CM"],r:87},
  {n:"Kai Havertz",pos:["CAM","ST","LW"],r:83},
  {n:"Thomas Muller",pos:["CAM","RW","ST"],r:84},
  {n:"Karim Adeyemi",pos:["LW","ST"],r:78},
  {n:"Niclas Fullkrug",pos:["ST"],r:78},
  {n:"Youssoufa Moukoko",pos:["ST"],r:74}
 ]},
  {y:2006,p:[
  {n:"Jens Lehmann",pos:["GK"],r:85},{n:"Oliver Kahn",pos:["GK"],r:84},{n:"Timo Hildebrand",pos:["GK"],r:76},
  {n:"Philipp Lahm",pos:["RB","LB"],r:84},{n:"Arne Friedrich",pos:["RB","CB"],r:78},
  {n:"Per Mertesacker",pos:["CB"],r:80},{n:"Christoph Metzelder",pos:["CB"],r:78},
  {n:"Robert Huth",pos:["CB"],r:76},{n:"Marcell Jansen",pos:["LB","LWB"],r:74},
  {n:"Sebastian Kehl",pos:["CDM","CM"],r:76},{n:"Jens Nowotny",pos:["CDM","CM"],r:74},
  {n:"Tim Borowski",pos:["CM","CDM"],r:74},{n:"Torsten Frings",pos:["CDM","CM"],r:80},
  {n:"Thomas Hitzlsperger",pos:["CM","LW"],r:76},{n:"Bernd Schneider",pos:["CM","RW"],r:77},
  {n:"Michael Ballack",pos:["CM","CAM"],r:89},{n:"Bastian Schweinsteiger",pos:["CM","LW"],r:84},
  {n:"David Odonkor",pos:["RW","LW"],r:73},{n:"Gerald Asamoah",pos:["LW","ST"],r:72},
  {n:"Lukas Podolski",pos:["LW","ST"],r:83},{n:"Mike Hanke",pos:["ST"],r:72},
  {n:"Oliver Neuville",pos:["ST","LW"],r:75},{n:"Miroslav Klose",pos:["ST"],r:87}
 ]},
  {y:2010,p:[
  {n:"Manuel Neuer",pos:["GK"],r:86},{n:"Hans-Jörg Butt",pos:["GK"],r:77},{n:"Tim Wiese",pos:["GK"],r:76},
  {n:"Philipp Lahm",pos:["RB","LB"],r:87},{n:"Arne Friedrich",pos:["RB","CB"],r:77},
  {n:"Per Mertesacker",pos:["CB"],r:82},{n:"Jérôme Boateng",pos:["CB","RB"],r:79},
  {n:"Holger Badstuber",pos:["CB"],r:78},{n:"Serdar Tasci",pos:["CB"],r:74},
  {n:"Dennis Aogo",pos:["LB","LWB"],r:74},{n:"Marcell Jansen",pos:["LB","CM"],r:72},
  {n:"Sami Khedira",pos:["CM","CDM"],r:82},{n:"Bastian Schweinsteiger",pos:["CM","CDM"],r:87},
  {n:"Toni Kroos",pos:["CM","CAM"],r:81},{n:"Piotr Trochowski",pos:["CM","CDM"],r:73},
  {n:"Mesut Özil",pos:["CAM","CM"],r:84},{n:"Marko Marin",pos:["LW","CAM"],r:73},
  {n:"Thomas Müller",pos:["CAM","RW","ST"],r:82},{n:"Serge Gnabry",pos:["RW","LW"],r:70},
  {n:"Stefan Kießling",pos:["ST"],r:75},{n:"Mario Gómez",pos:["ST"],r:80},
  {n:"Lukas Podolski",pos:["LW","ST"],r:82},{n:"Miroslav Klose",pos:["ST"],r:85},
  {n:"Cacau",pos:["ST","LW"],r:75}
 ]},
  {y:2014,p:[
  {n:"Manuel Neuer",pos:["GK"],r:93},{n:"Roman Weidenfeller",pos:["GK"],r:79},{n:"Ron-Robert Zieler",pos:["GK"],r:77},
  {n:"Philipp Lahm",pos:["RB","LB"],r:88},{n:"Jérôme Boateng",pos:["CB"],r:85},
  {n:"Mats Hummels",pos:["CB"],r:87},{n:"Per Mertesacker",pos:["CB"],r:82},
  {n:"Benedikt Höwedes",pos:["CB","LB"],r:79},{n:"Shkodran Mustafi",pos:["CB","RB"],r:77},
  {n:"Erik Durm",pos:["LB","RB"],r:72},{n:"Kevin Großkreutz",pos:["RB","CM"],r:72},
  {n:"Sami Khedira",pos:["CM","CDM"],r:84},{n:"Bastian Schweinsteiger",pos:["CM","CDM"],r:86},
  {n:"Toni Kroos",pos:["CM","CDM"],r:88},{n:"Christoph Kramer",pos:["CDM","CM"],r:74},
  {n:"Mesut Özil",pos:["CAM","CM"],r:87},{n:"Thomas Müller",pos:["CAM","RW","ST"],r:87},
  {n:"Julian Draxler",pos:["LW","CAM"],r:78},{n:"André Schürrle",pos:["LW","RW"],r:78},
  {n:"Lukas Podolski",pos:["LW","ST"],r:80},{n:"Matthias Ginter",pos:["CB","CDM"],r:75},
  {n:"Mario Götze",pos:["CAM","LW","ST"],r:85},{n:"Miroslav Klose",pos:["ST"],r:83}
 ]},
  {y:1994,p:[
  {n:"Bodo Illgner",pos:["GK"],r:82},{n:"Andreas Köpke",pos:["GK"],r:82},{n:"Oliver Kahn",pos:["GK"],r:82},
  {n:"Thomas Berthold",pos:["RB","CB"],r:76},{n:"Jürgen Kohler",pos:["CB"],r:84},
  {n:"Guido Buchwald",pos:["CB","CDM"],r:80},{n:"Thomas Helmer",pos:["CB"],r:79},
  {n:"Andreas Brehme",pos:["LB","LWB"],r:83},{n:"Matthias Sammer",pos:["CDM","CB"],r:86},
  {n:"Thomas Strunz",pos:["CDM","CM"],r:74},{n:"Thomas Häßler",pos:["CM","CDM"],r:80},
  {n:"Stefan Effenberg",pos:["CM","CAM"],r:83},{n:"Andreas Möller",pos:["CM","CAM"],r:83},
  {n:"Mario Basler",pos:["CM","LW"],r:78},{n:"Maurizio Gaudino",pos:["CM","LW"],r:72},
  {n:"Lothar Matthäus",pos:["CM","CDM"],r:87},{n:"Karl-Heinz Riedle",pos:["LW","ST"],r:77},
  {n:"Ulf Kirsten",pos:["LW","ST"],r:77},{n:"Stefan Kuntz",pos:["ST"],r:76},
  {n:"Martin Wagner",pos:["ST"],r:72},{n:"Rudi Völler",pos:["ST","LW"],r:84},
  {n:"Jürgen Klinsmann",pos:["ST"],r:86}
 ]},
  {y:1998,p:[
  {n:"Oliver Kahn",pos:["GK"],r:86},{n:"Andreas Köpke",pos:["GK"],r:82},{n:"Jens Lehmann",pos:["GK"],r:77},
  {n:"Markus Babbel",pos:["RB","CB"],r:77},{n:"Jürgen Kohler",pos:["CB"],r:82},
  {n:"Christian Wörns",pos:["CB"],r:77},{n:"Thomas Helmer",pos:["CB"],r:76},
  {n:"Stefan Reuter",pos:["RB","LB"],r:76},{n:"Jörg Heinrich",pos:["LB","LWB"],r:74},
  {n:"Michael Tarnat",pos:["LB","CDM"],r:74},{n:"Lothar Matthäus",pos:["CDM","CM"],r:82},
  {n:"Jens Jeremies",pos:["CDM","CM"],r:77},{n:"Steffen Freund",pos:["CDM","CM"],r:75},
  {n:"Thomas Häßler",pos:["CM","CDM"],r:78},{n:"Olaf Thon",pos:["CM","CAM"],r:75},
  {n:"Christian Ziege",pos:["LW","LB"],r:77},{n:"Andreas Möller",pos:["CM","CAM"],r:80},
  {n:"Dietmar Hamann",pos:["CDM","CM"],r:79},{n:"Oliver Bierhoff",pos:["ST"],r:81},
  {n:"Ulf Kirsten",pos:["ST","LW"],r:74},{n:"Olaf Marschall",pos:["ST","LW"],r:72},
  {n:"Jürgen Klinsmann",pos:["ST"],r:82}
 ]},
  {y:2002,p:[
  {n:"Oliver Kahn",pos:["GK"],r:90},{n:"Jens Lehmann",pos:["GK"],r:80},{n:"Hans-Jörg Butt",pos:["GK"],r:74},
  {n:"Thomas Linke",pos:["CB","RB"],r:75},{n:"Carsten Ramelow",pos:["CB","CDM"],r:77},
  {n:"Christoph Metzelder",pos:["CB"],r:77},{n:"Marko Rehmer",pos:["CB"],r:73},
  {n:"Jörg Böhme",pos:["LW","CM"],r:72},{n:"Christian Ziege",pos:["LB","LWB"],r:75},
  {n:"Sebastian Kehl",pos:["CDM","CM"],r:74},{n:"Jens Jeremies",pos:["CDM","CM"],r:75},
  {n:"Dietmar Hamann",pos:["CDM","CM"],r:81},{n:"Bernd Schneider",pos:["CM","RW"],r:76},
  {n:"Frank Baumann",pos:["CM","CDM"],r:73},{n:"Lars Ricken",pos:["CM","LW"],r:72},
  {n:"Michael Ballack",pos:["CM","CAM"],r:86},{n:"Gerald Asamoah",pos:["LW","ST"],r:72},
  {n:"Marco Bode",pos:["LW","CM"],r:73},{n:"Carsten Jancker",pos:["ST"],r:74},
  {n:"Oliver Bierhoff",pos:["ST"],r:79},{n:"Oliver Neuville",pos:["ST","LW"],r:74},
  {n:"Torsten Frings",pos:["CDM","CM"],r:78},{n:"Miroslav Klose",pos:["ST"],r:82}
 ]}
 ],
 "France":[
  ,
  {y:2018,p:[{n:"Hugo Lloris",pos:["GK"],r:87},{n:"Steve Mandanda",pos:["GK"],r:76},{n:"Alphonse Areola",pos:["GK"],r:75},{n:"Benjamin Pavard",pos:["RB","CB"],r:81},{n:"Raphael Varane",pos:["CB"],r:89},{n:"Samuel Umtiti",pos:["CB"],r:83},{n:"Lucas Hernandez",pos:["LB","CB"],r:82},{n:"Presnel Kimpembe",pos:["CB"],r:78},{n:"Djibril Sidibe",pos:["RB"],r:78},{n:"N'Golo Kante",pos:["CDM","CM"],r:92},{n:"Paul Pogba",pos:["CM","CDM"],r:87},{n:"Blaise Matuidi",pos:["CM","LM"],r:82},{n:"Corentin Tolisso",pos:["CM","CDM"],r:78},{n:"Antoine Griezmann",pos:["ST","CAM","LW"],r:90},{n:"Kylian Mbappe",pos:["LW","ST","RW"],r:91},{n:"Ousmane Dembele",pos:["RW","LW"],r:80},{n:"Thomas Lemar",pos:["LW","CM"],r:77},{n:"Olivier Giroud",pos:["ST"],r:83},{n:"Florian Thauvin",pos:["RW","CAM"],r:77},{n:"Nabil Fekir",pos:["CAM","LW"],r:80},{n:"Steven Nzonzi",pos:["CDM","CM"],r:76},{n:"Adil Rami",pos:["CB"],r:75},{n:"Adrien Rabiot",pos:["CM","CDM"],r:78}]},
  {y:2022,p:[{n:"Hugo Lloris",pos:["GK"],r:83},{n:"Steve Mandanda",pos:["GK"],r:72},{n:"Alphonse Areola",pos:["GK"],r:76},{n:"Jules Kounde",pos:["RB","CB"],r:84},{n:"Raphael Varane",pos:["CB"],r:85},{n:"Dayot Upamecano",pos:["CB"],r:83},{n:"Theo Hernandez",pos:["LB","LWB"],r:84},{n:"Presnel Kimpembe",pos:["CB"],r:78},{n:"Jonathan Clauss",pos:["RB","RWB"],r:75},{n:"Aurelien Tchouameni",pos:["CDM","CM"],r:84},{n:"Adrien Rabiot",pos:["CM","CDM"],r:81},{n:"Eduardo Camavinga",pos:["CM","CDM"],r:82},{n:"Youssouf Fofana",pos:["CDM","CM"],r:76},{n:"Antoine Griezmann",pos:["ST","CAM","LW"],r:88},{n:"Kylian Mbappe",pos:["LW","ST","RW"],r:96},{n:"Ousmane Dembele",pos:["RW","LW"],r:84},{n:"Kingsley Coman",pos:["LW","RW"],r:82},{n:"Olivier Giroud",pos:["ST"],r:82},{n:"Marcus Thuram",pos:["ST","LW"],r:80},{n:"Randal Kolo Muani",pos:["ST","LW"],r:79},{n:"Christopher Nkunku",pos:["CAM","LW","ST"],r:82},{n:"William Saliba",pos:["CB"],r:83},{n:"Ibrahima Konate",pos:["CB"],r:80}]},
  {y:2006,p:[
  {n:"Fabien Barthez",pos:["GK"],r:79},{n:"Grégory Coupet",pos:["GK"],r:79},{n:"Mickaël Landreau",pos:["GK"],r:74},
  {n:"Willy Sagnol",pos:["RB","RWB"],r:80},{n:"Jean-Alain Boumsong",pos:["CB"],r:76},
  {n:"Lilian Thuram",pos:["CB","RB"],r:84},{n:"William Gallas",pos:["CB","LB"],r:83},
  {n:"Gaël Givet",pos:["LB","CB"],r:73},{n:"Mikaël Silvestre",pos:["LB","CB"],r:77},
  {n:"Pascal Chimbonda",pos:["RB","CM"],r:74},{n:"Claude Makélélé",pos:["CDM","CM"],r:88},
  {n:"Alou Diarra",pos:["CDM","CM"],r:76},{n:"Patrick Vieira",pos:["CM","CDM"],r:85},
  {n:"Vikash Dhorasoo",pos:["CM","CAM"],r:73},{n:"Sidney Govou",pos:["RW","LW"],r:74},
  {n:"Sylvain Wiltord",pos:["LW","RW","CAM"],r:76},{n:"Franck Ribéry",pos:["LW","CAM"],r:83},
  {n:"Florent Malouda",pos:["LW","LM"],r:78},{n:"Thierry Henry",pos:["ST","LW"],r:92},
  {n:"Louis Saha",pos:["ST","LW"],r:77},{n:"David Trezeguet",pos:["ST"],r:83},
  {n:"Zinedine Zidane",pos:["CAM","CM"],r:96},{n:"Eric Abidal",pos:["LB","CB"],r:80}
 ]},
  {y:2010,p:[
  {n:"Hugo Lloris",pos:["GK"],r:84},{n:"Steve Mandanda",pos:["GK"],r:77},{n:"Cédric Carrasso",pos:["GK"],r:73},
  {n:"Bacary Sagna",pos:["RB","RWB"],r:80},{n:"William Gallas",pos:["CB","LB"],r:80},
  {n:"Sébastien Squillaci",pos:["CB"],r:74},{n:"Marc Planus",pos:["CB"],r:73},
  {n:"Patrice Evra",pos:["LB","LWB"],r:83},{n:"Gaël Clichy",pos:["LB","LWB"],r:77},
  {n:"Anthony Réveillère",pos:["RB","CM"],r:72},{n:"Alou Diarra",pos:["CDM","CM"],r:75},
  {n:"Jérémy Toulalan",pos:["CDM","CM"],r:78},{n:"Abou Diaby",pos:["CM","CDM"],r:75},
  {n:"Yoann Gourcuff",pos:["CM","CAM"],r:77},{n:"Mathieu Valbuena",pos:["LW","CAM"],r:77},
  {n:"Florent Malouda",pos:["LW","LM"],r:77},{n:"Franck Ribéry",pos:["LW","CAM"],r:87},
  {n:"Sidney Govou",pos:["RW","LW"],r:73},{n:"Djibril Cissé",pos:["ST","LW"],r:74},
  {n:"Nicolas Anelka",pos:["ST","LW"],r:79},{n:"André-Pierre Gignac",pos:["ST"],r:77},
  {n:"Thierry Henry",pos:["ST","LW"],r:84},{n:"Eric Abidal",pos:["LB","CB"],r:78}
 ]},
  {y:2014,p:[
  {n:"Hugo Lloris",pos:["GK"],r:87},{n:"Stéphane Ruffier",pos:["GK"],r:76},{n:"Mickaël Landreau",pos:["GK"],r:73},
  {n:"Mathieu Debuchy",pos:["RB","RWB"],r:78},{n:"Raphaël Varane",pos:["CB"],r:83},
  {n:"Laurent Koscielny",pos:["CB"],r:82},{n:"Eliaquim Mangala",pos:["CB"],r:78},
  {n:"Mamadou Sakho",pos:["CB","LB"],r:79},{n:"Bacary Sagna",pos:["RB","RWB"],r:78},
  {n:"Patrice Evra",pos:["LB","LWB"],r:81},{n:"Lucas Digne",pos:["LB","LWB"],r:74},
  {n:"Blaise Matuidi",pos:["CM","CDM"],r:84},{n:"Morgan Schneiderlin",pos:["CDM","CM"],r:80},
  {n:"Yohan Cabaye",pos:["CM","CAM"],r:79},{n:"Rio Mavuba",pos:["CDM","CM"],r:73},
  {n:"Rémy Cabella",pos:["LW","CAM"],r:73},{n:"Mathieu Valbuena",pos:["LW","CAM"],r:76},
  {n:"Moussa Sissoko",pos:["CM","LW"],r:77},{n:"Antoine Griezmann",pos:["LW","ST","CAM"],r:82},
  {n:"Loïc Rémy",pos:["ST","LW"],r:76},{n:"Olivier Giroud",pos:["ST"],r:80},
  {n:"Paul Pogba",pos:["CM","CDM"],r:83},{n:"Karim Benzema",pos:["ST"],r:88}
 ]},
  {y:1998,p:[
  {n:"Fabien Barthez",pos:["GK"],r:88},{n:"Bernard Lama",pos:["GK"],r:79},{n:"Lionel Charbonnier",pos:["GK"],r:74},
  {n:"Lilian Thuram",pos:["CB","RB"],r:87},{n:"Marcel Desailly",pos:["CB"],r:88},
  {n:"Frank Leboeuf",pos:["CB"],r:80},{n:"Laurent Blanc",pos:["CB"],r:86},
  {n:"Bixente Lizarazu",pos:["LB","LWB"],r:83},{n:"Vincent Candela",pos:["LB","CB"],r:76},
  {n:"Didier Deschamps",pos:["CDM","CM"],r:85},{n:"Alain Boghossian",pos:["CDM","CM"],r:74},
  {n:"Emmanuel Petit",pos:["CM","CDM"],r:83},{n:"Patrick Vieira",pos:["CM","CDM"],r:85},
  {n:"Christian Karembeu",pos:["CM","CDM"],r:76},{n:"Robert Pires",pos:["LW","CAM"],r:80},
  {n:"Youri Djorkaeff",pos:["CAM","ST"],r:82},{n:"Bernard Diomède",pos:["LW","RW"],r:72},
  {n:"Christophe Dugarry",pos:["ST","LW"],r:74},{n:"David Trezeguet",pos:["ST"],r:80},
  {n:"Thierry Henry",pos:["LW","ST"],r:83},{n:"Stéphane Guivarc'h",pos:["ST"],r:73},
  {n:"Zinedine Zidane",pos:["CAM","CM"],r:96}
 ]},
  {y:2002,p:[
  {n:"Fabien Barthez",pos:["GK"],r:86},{n:"Grégory Coupet",pos:["GK"],r:78},{n:"Ulrich Ramé",pos:["GK"],r:74},
  {n:"Willy Sagnol",pos:["RB","RWB"],r:79},{n:"Marcel Desailly",pos:["CB"],r:85},
  {n:"Philippe Christanval",pos:["CB"],r:73},{n:"Frank Leboeuf",pos:["CB"],r:78},
  {n:"Lilian Thuram",pos:["CB","RB"],r:85},{n:"Bixente Lizarazu",pos:["LB","LWB"],r:82},
  {n:"Vincent Candela",pos:["LB","CB"],r:74},{n:"Mikaël Silvestre",pos:["LB","CB"],r:76},
  {n:"Emmanuel Petit",pos:["CDM","CM"],r:81},{n:"Claude Makélélé",pos:["CDM","CM"],r:87},
  {n:"Patrick Vieira",pos:["CM","CDM"],r:87},{n:"Alain Boghossian",pos:["CDM","CM"],r:72},
  {n:"Johan Micoud",pos:["CM","CAM"],r:74},{n:"Christophe Dugarry",pos:["ST","LW"],r:73},
  {n:"Sylvain Wiltord",pos:["LW","RW"],r:78},{n:"David Trezeguet",pos:["ST"],r:82},
  {n:"Youri Djorkaeff",pos:["CAM","ST"],r:79},{n:"Djibril Cissé",pos:["ST","LW"],r:75},
  {n:"Thierry Henry",pos:["LW","ST"],r:87},{n:"Zinedine Zidane",pos:["CAM","CM"],r:96}
 ]},
  {y:1982,p:[
  {n:"Jean-Luc Ettori",pos:["GK"],r:78},{n:"Dominique Baratelli",pos:["GK"],r:76},{n:"Jean Castaneda",pos:["GK"],r:70},
  {n:"Gérard Janvion",pos:["RB","CB"],r:74},{n:"Marius Trésor",pos:["CB"],r:79},
  {n:"Maxime Bossis",pos:["CB","LB"],r:80},{n:"Christian Lopez",pos:["CB"],r:72},
  {n:"Manuel Amoros",pos:["LB","LWB"],r:79},{n:"Patrick Battiston",pos:["RB","CB"],r:76},
  {n:"René Girard",pos:["CDM","CM"],r:73},{n:"Alain Giresse",pos:["CM","CAM"],r:82},
  {n:"Jean Tigana",pos:["CM","CDM"],r:84},{n:"Bernard Genghini",pos:["CM","CDM"],r:74},
  {n:"Jean-François Larios",pos:["CM","LW"],r:71},{n:"Philippe Mahut",pos:["LW","CM"],r:70},
  {n:"Alain Couriol",pos:["LW","RW"],r:71},{n:"Gérard Soler",pos:["LW","ST"],r:73},
  {n:"Dominique Rocheteau",pos:["LW","ST"],r:78},{n:"Bruno Bellone",pos:["ST","LW"],r:73},
  {n:"Bernard Lacombe",pos:["ST","LW"],r:74},{n:"Didier Six",pos:["LW","ST"],r:76},
  {n:"Michel Platini",pos:["CAM","CM"],r:92}
 ]},
  {y:1986,p:[
  {n:"Joël Bats",pos:["GK"],r:80},{n:"Albert Rust",pos:["GK"],r:74},{n:"Philippe Bergeroo",pos:["GK"],r:72},
  {n:"William Ayache",pos:["RB","CB"],r:73},{n:"Maxime Bossis",pos:["CB"],r:78},
  {n:"Patrick Battiston",pos:["CB","RB"],r:76},{n:"Yvon Le Roux",pos:["CB"],r:72},
  {n:"Manuel Amoros",pos:["LB","LWB"],r:79},{n:"Thierry Tusseau",pos:["LB","CB"],r:71},
  {n:"Luis Fernández",pos:["CDM","CM"],r:77},{n:"Alain Giresse",pos:["CM","CAM"],r:80},
  {n:"Jean Tigana",pos:["CM","CDM"],r:83},{n:"Bernard Genghini",pos:["CM","CDM"],r:73},
  {n:"Jean-Marc Ferreri",pos:["CM","LW"],r:71},{n:"Michel Bibard",pos:["LW","CM"],r:70},
  {n:"Philippe Vercruysse",pos:["LW","RW"],r:71},{n:"Daniel Xuereb",pos:["LW","ST"],r:72},
  {n:"Dominique Rocheteau",pos:["LW","ST"],r:76},{n:"Bruno Bellone",pos:["ST","LW"],r:73},
  {n:"Yannick Stopyra",pos:["ST","LW"],r:73},{n:"Jean-Pierre Papin",pos:["ST","LW"],r:80},
  {n:"Michel Platini",pos:["CAM","CM"],r:93}
 ]}
 ],
 "Argentina":[
  ,
  {y:2018,p:[
  {n:"Willy Caballero",pos:["GK"],r:74},
  {n:"Franco Armani",pos:["GK"],r:78},
  {n:"Nahuel Guzman",pos:["GK"],r:74},
  {n:"Gabriel Mercado",pos:["RB","CB"],r:77},
  {n:"Federico Fazio",pos:["CB"],r:74},
  {n:"Nicolas Otamendi",pos:["CB"],r:83},
  {n:"Marcos Rojo",pos:["CB","LB"],r:76},
  {n:"Cristian Ansaldi",pos:["LB","LWB"],r:75},
  {n:"Nicolas Tagliafico",pos:["LB","LWB"],r:77},
  {n:"Javier Mascherano",pos:["CDM","CB"],r:82},
  {n:"Lucas Biglia",pos:["CDM","CM"],r:78},
  {n:"Ever Banega",pos:["CM","CAM"],r:80},
  {n:"Enzo Perez",pos:["CM","CDM"],r:75},
  {n:"Giovani Lo Celso",pos:["CM","CAM"],r:76},
  {n:"Maximiliano Meza",pos:["LW","CAM"],r:73},
  {n:"Lionel Messi",pos:["CAM","RW","ST"],r:98},
  {n:"Angel Di Maria",pos:["RW","LW","CAM"],r:86},
  {n:"Paulo Dybala",pos:["CAM","ST","LW"],r:85},
  {n:"Cristian Pavon",pos:["RW","LW"],r:75},
  {n:"Eduardo Salvio",pos:["RW","ST"],r:76},
  {n:"Gonzalo Higuain",pos:["ST"],r:83},
  {n:"Sergio Aguero",pos:["ST"],r:89}
 ]},
  {y:2022,p:[
  {n:"Emiliano Martinez",pos:["GK"],r:87},
  {n:"Franco Armani",pos:["GK"],r:78},
  {n:"Geronimo Rulli",pos:["GK"],r:75},
  {n:"Nahuel Molina",pos:["RB","RWB"],r:80},
  {n:"Gonzalo Montiel",pos:["RB","RWB"],r:78},
  {n:"Juan Foyth",pos:["RB","CB"],r:77},
  {n:"Cristian Romero",pos:["CB"],r:85},
  {n:"Lisandro Martinez",pos:["CB"],r:84},
  {n:"Nicolas Otamendi",pos:["CB"],r:83},
  {n:"German Pezzella",pos:["CB"],r:75},
  {n:"Nicolas Tagliafico",pos:["LB","LWB"],r:80},
  {n:"Marcos Acuna",pos:["LB","LWB"],r:78},
  {n:"Rodrigo De Paul",pos:["CM","CDM"],r:85},
  {n:"Enzo Fernandez",pos:["CM","CDM"],r:82},
  {n:"Alexis Mac Allister",pos:["CM","CAM"],r:83},
  {n:"Leandro Paredes",pos:["CDM","CM"],r:81},
  {n:"Guido Rodriguez",pos:["CDM","CM"],r:76},
  {n:"Exequiel Palacios",pos:["CM","CDM"],r:76},
  {n:"Thiago Almada",pos:["CAM","CM"],r:71},
  {n:"Lionel Messi",pos:["CAM","RW","ST"],r:99},
  {n:"Angel Di Maria",pos:["RW","LW","CAM"],r:84},
  {n:"Paulo Dybala",pos:["CAM","ST","RW"],r:84},
  {n:"Papu Gomez",pos:["CAM","LW"],r:77},
  {n:"Angel Correa",pos:["ST","LW","RW"],r:77},
  {n:"Nicolas Gonzalez",pos:["LW","ST"],r:76},
  {n:"Julian Alvarez",pos:["ST","LW"],r:85},
  {n:"Lautaro Martinez",pos:["ST"],r:84}
 ]},
  {y:2006,p:[
  {n:"Roberto Abbondanzieri",pos:["GK"],r:78},{n:"Leo Franco",pos:["GK"],r:74},{n:"Óscar Ustari",pos:["GK"],r:72},
  {n:"Fabricio Coloccini",pos:["CB","RB"],r:77},{n:"Roberto Ayala",pos:["CB"],r:82},
  {n:"Gabriel Milito",pos:["CB"],r:76},{n:"Gabriel Heinze",pos:["LB","CB"],r:80},
  {n:"Leandro Cufré",pos:["LB","RB"],r:73},{n:"Lionel Scaloni",pos:["RB","CM"],r:70},
  {n:"Juan Pablo Sorín",pos:["LB","LWB"],r:77},{n:"Nicolás Burdisso",pos:["CB"],r:76},
  {n:"Javier Mascherano",pos:["CDM","CM"],r:82},{n:"Esteban Cambiasso",pos:["CM","CDM"],r:82},
  {n:"Lucho González",pos:["CM","CDM"],r:78},{n:"Pablo Aimar",pos:["CAM","CM"],r:79},
  {n:"Juan Román Riquelme",pos:["CAM","CM"],r:85},{n:"Maxi Rodríguez",pos:["LW","CM"],r:80},
  {n:"Javier Saviola",pos:["CAM","LW"],r:78},{n:"Rodrigo Palacio",pos:["LW","ST"],r:74},
  {n:"Hernán Crespo",pos:["ST"],r:83},{n:"Julio Cruz",pos:["ST"],r:77},
  {n:"Carlos Tevez",pos:["ST","LW"],r:85},{n:"Lionel Messi",pos:["LW","CAM","RW"],r:84}
 ]},
  {y:2010,p:[
  {n:"Sergio Romero",pos:["GK"],r:80},{n:"Mariano Andújar",pos:["GK"],r:74},{n:"Diego Pozo",pos:["GK"],r:70},
  {n:"Jonás Gutiérrez",pos:["RW","LW","RB"],r:74},{n:"Nicolás Burdisso",pos:["CB"],r:76},
  {n:"Walter Samuel",pos:["CB"],r:82},{n:"Nicolás Otamendi",pos:["CB"],r:76},
  {n:"Gabriel Heinze",pos:["LB","CB"],r:79},{n:"Clemente Rodríguez",pos:["LB"],r:72},
  {n:"Javier Mascherano",pos:["CDM","CM"],r:86},{n:"Juan Sebastián Verón",pos:["CM","CAM"],r:79},
  {n:"Ariel Garcé",pos:["CM","CDM"],r:72},{n:"Mario Bolatti",pos:["CM","CDM"],r:72},
  {n:"Martín Demichelis",pos:["CB","CDM"],r:77},{n:"Maxi Rodríguez",pos:["LW","CM"],r:79},
  {n:"Ángel Di María",pos:["LW","RW","CAM"],r:83},{n:"Javier Pastore",pos:["CAM","CM"],r:79},
  {n:"Carlos Tevez",pos:["ST","LW"],r:87},{n:"Diego Milito",pos:["ST"],r:83},
  {n:"Martín Palermo",pos:["ST"],r:74},{n:"Sergio Agüero",pos:["ST","LW"],r:84},
  {n:"Gonzalo Higuaín",pos:["ST"],r:84},{n:"Lionel Messi",pos:["CAM","RW","ST"],r:91}
 ]},
  {y:2014,p:[
  {n:"Sergio Romero",pos:["GK"],r:80},{n:"Mariano Andújar",pos:["GK"],r:73},{n:"Agustín Orión",pos:["GK"],r:71},
  {n:"Pablo Zabaleta",pos:["RB","RWB"],r:81},{n:"Ezequiel Garay",pos:["CB"],r:79},
  {n:"Martín Demichelis",pos:["CB"],r:77},{n:"José María Basanta",pos:["CB"],r:74},
  {n:"Federico Fernández",pos:["CB"],r:75},{n:"Hugo Campagnaro",pos:["CB"],r:73},
  {n:"Marcos Rojo",pos:["LB","CB"],r:79},{n:"Javier Mascherano",pos:["CDM","CB"],r:87},
  {n:"Fernando Gago",pos:["CDM","CM"],r:80},{n:"Lucas Biglia",pos:["CDM","CM"],r:79},
  {n:"Augusto Fernández",pos:["CM","CDM"],r:74},{n:"Enzo Pérez",pos:["CM","CDM"],r:75},
  {n:"Maxi Rodríguez",pos:["LW","CM"],r:77},{n:"Ángel Di María",pos:["RW","LW","CAM"],r:88},
  {n:"Ricky Álvarez",pos:["CAM","LW"],r:73},{n:"Ezequiel Lavezzi",pos:["LW","RW"],r:79},
  {n:"Gonzalo Higuaín",pos:["ST"],r:87},{n:"Rodrigo Palacio",pos:["ST","LW"],r:77},
  {n:"Sergio Agüero",pos:["ST"],r:90},{n:"Lionel Messi",pos:["CAM","RW","ST"],r:96}
 ]},
  {y:1994,p:[
  {n:"Sergio Goycochea",pos:["GK"],r:79},{n:"Norberto Scoponi",pos:["GK"],r:74},{n:"Luis Islas",pos:["GK"],r:74},
  {n:"Roberto Néstor Sensini",pos:["CB","RB"],r:78},{n:"Oscar Ruggeri",pos:["CB"],r:82},
  {n:"José Chamot",pos:["CB","LB"],r:77},{n:"Fernando Cáceres",pos:["CB","RB"],r:74},
  {n:"Jorge Borelli",pos:["CB"],r:71},{n:"Hernán Díaz",pos:["LB","CB"],r:71},
  {n:"Fernando Redondo",pos:["CDM","CM"],r:86},{n:"Diego Simeone",pos:["CM","CDM"],r:82},
  {n:"José Basualdo",pos:["CM","CDM"],r:74},{n:"Hugo Pérez",pos:["CM","CAM"],r:72},
  {n:"Leonardo Rodríguez",pos:["CM","LB"],r:71},{n:"Alejandro Mancuso",pos:["CM"],r:70},
  {n:"Ramón Medina Bello",pos:["LW","CM"],r:71},{n:"Abel Balbo",pos:["ST","LW"],r:76},
  {n:"Sergio Vázquez",pos:["LW","ST"],r:70},{n:"Ariel Ortega",pos:["CAM","LW"],r:80},
  {n:"Claudio Caniggia",pos:["LW","ST"],r:83},{n:"Gabriel Batistuta",pos:["ST"],r:90},
  {n:"Diego Maradona",pos:["CAM","CM"],r:88}
 ]},
  {y:1998,p:[
  {n:"Carlos Roa",pos:["GK"],r:78},{n:"Pablo Cavallero",pos:["GK"],r:74},{n:"Germán Burgos",pos:["GK"],r:74},
  {n:"Roberto Néstor Sensini",pos:["CB","RB"],r:77},{n:"Roberto Ayala",pos:["CB"],r:82},
  {n:"José Chamot",pos:["CB","LB"],r:77},{n:"Nelson Vivas",pos:["RB","CB"],r:73},
  {n:"Javier Zanetti",pos:["RB","RWB"],r:86},{n:"Mauricio Pineda",pos:["LB","CB"],r:71},
  {n:"Pablo Paz",pos:["LB"],r:70},{n:"Leonardo Astrada",pos:["CDM","CM"],r:75},
  {n:"Diego Simeone",pos:["CM","CDM"],r:83},{n:"Matías Almeyda",pos:["CM","CDM"],r:74},
  {n:"Marcelo Delgado",pos:["CM","LW"],r:72},{n:"Marcelo Gallardo",pos:["CAM","CM"],r:77},
  {n:"Juan Sebastián Verón",pos:["CM","CAM"],r:81},{n:"Abel Balbo",pos:["ST","LW"],r:74},
  {n:"Claudio López",pos:["LW","RW"],r:76},{n:"Ariel Ortega",pos:["CAM","LW"],r:82},
  {n:"Sergio Berti",pos:["CM","LW"],r:71},{n:"Hernán Crespo",pos:["ST"],r:80},
  {n:"Gabriel Batistuta",pos:["ST"],r:92}
 ]},
  {y:2002,p:[
  {n:"Pablo Cavallero",pos:["GK"],r:76},{n:"Germán Burgos",pos:["GK"],r:73},{n:"Roberto Bonano",pos:["GK"],r:72},
  {n:"Javier Zanetti",pos:["RB","RWB"],r:87},{n:"Roberto Ayala",pos:["CB"],r:83},
  {n:"José Chamot",pos:["CB","LB"],r:75},{n:"Walter Samuel",pos:["CB"],r:79},
  {n:"Diego Placente",pos:["LB","CB"],r:73},{n:"Mauricio Pochettino",pos:["CB"],r:74},
  {n:"Matías Almeyda",pos:["CDM","CM"],r:73},{n:"Diego Simeone",pos:["CM","CDM"],r:81},
  {n:"Juan Sebastián Verón",pos:["CM","CAM"],r:85},{n:"Pablo Aimar",pos:["CAM","CM"],r:81},
  {n:"Marcelo Gallardo",pos:["CAM","CM"],r:75},{n:"Kily González",pos:["LW","CM"],r:74},
  {n:"Gustavo López",pos:["CM","CDM"],r:72},{n:"Claudio Husaín",pos:["CM","CDM"],r:70},
  {n:"Claudio López",pos:["LW","RW"],r:74},{n:"Claudio Caniggia",pos:["LW","ST"],r:77},
  {n:"Ariel Ortega",pos:["CAM","LW"],r:79},{n:"Hernán Crespo",pos:["ST"],r:83},
  {n:"Juan Pablo Sorín",pos:["LB","LWB"],r:76},{n:"Gabriel Batistuta",pos:["ST"],r:87}
 ]},
  {y:1982,p:[
  {n:"Ubaldo Fillol",pos:["GK"],r:83},{n:"Héctor Baley",pos:["GK"],r:74},{n:"Nery Pumpido",pos:["GK"],r:77},
  {n:"Jorge Olguín",pos:["RB","CB"],r:75},{n:"Daniel Passarella",pos:["CB"],r:84},
  {n:"Luis Galván",pos:["CB"],r:77},{n:"Julio Olarticoechea",pos:["CB","LB"],r:75},
  {n:"Alberto Tarantini",pos:["LB","CB"],r:74},{n:"Patricio Hernández",pos:["RB"],r:70},
  {n:"Américo Gallego",pos:["CDM","CM"],r:77},{n:"Osvaldo Ardiles",pos:["CM","CDM"],r:83},
  {n:"José Van Tuyne",pos:["CM","CDM"],r:70},{n:"Santiago Santamaría",pos:["CM"],r:70},
  {n:"Gabriel Calderón",pos:["CM","LW"],r:74},{n:"Juan Barbas",pos:["CM","CAM"],r:72},
  {n:"Enzo Trossero",pos:["CB","CDM"],r:72},{n:"José Daniel Valencia",pos:["LW","CM"],r:70},
  {n:"Jorge Valdano",pos:["LW","ST"],r:80},{n:"Daniel Bertoni",pos:["RW","LW"],r:76},
  {n:"Ramón Díaz",pos:["ST","LW"],r:79},{n:"Mario Kempes",pos:["ST","LW"],r:86},
  {n:"Diego Maradona",pos:["CAM","LW"],r:90}
 ]},
  {y:1986,p:[
  {n:"Nery Pumpido",pos:["GK"],r:80},{n:"Héctor Zelada",pos:["GK"],r:74},{n:"Luis Islas",pos:["GK"],r:73},
  {n:"Néstor Clausen",pos:["RB","CB"],r:73},{n:"Oscar Ruggeri",pos:["CB"],r:82},
  {n:"José Luis Brown",pos:["CB"],r:76},{n:"José Luis Cuciuffo",pos:["CB","RB"],r:73},
  {n:"Julio Olarticoechea",pos:["LB","LWB"],r:75},{n:"Oscar Garré",pos:["LB","CB"],r:72},
  {n:"Sergio Batista",pos:["CDM","CM"],r:78},{n:"Ricardo Giusti",pos:["CM","CDM"],r:74},
  {n:"Héctor Enrique",pos:["CM","CDM"],r:74},{n:"Carlos Tapia",pos:["CM","CDM"],r:73},
  {n:"Daniel Passarella",pos:["CB","CDM"],r:81},{n:"Sergio Almirón",pos:["LW","CM"],r:72},
  {n:"Marcelo Trobbiani",pos:["CAM","CM"],r:73},{n:"Claudio Borghi",pos:["CM","CAM"],r:74},
  {n:"Ricardo Bochini",pos:["CAM","CM"],r:76},{n:"Jorge Burruchaga",pos:["CM","LW"],r:79},
  {n:"Jorge Valdano",pos:["LW","ST"],r:81},{n:"Pedro Pasculli",pos:["ST","LW"],r:73},
  {n:"Diego Maradona",pos:["CAM","LW"],r:96}
 ]},
  {y:1990,p:[
  {n:"Sergio Goycochea",pos:["GK"],r:81},{n:"Nery Pumpido",pos:["GK"],r:79},{n:"Fabián Cancelarich",pos:["GK"],r:70},
  {n:"Roberto Néstor Sensini",pos:["CB","RB"],r:77},{n:"Oscar Ruggeri",pos:["CB"],r:81},
  {n:"José Serrizuela",pos:["CB","RB"],r:73},{n:"Edgardo Bauza",pos:["CB"],r:72},
  {n:"Julio Olarticoechea",pos:["LB","LWB"],r:74},{n:"Néstor Lorenzo",pos:["LB","CB"],r:71},
  {n:"Sergio Batista",pos:["CDM","CM"],r:77},{n:"Juan Simón",pos:["CDM","CM"],r:73},
  {n:"Ricardo Giusti",pos:["CM","CDM"],r:73},{n:"José Basualdo",pos:["CM","CDM"],r:73},
  {n:"Pedro Troglio",pos:["CM","CDM"],r:72},{n:"Gabriel Calderón",pos:["CM","LW"],r:72},
  {n:"Pedro Monzón",pos:["CM","CB"],r:72},{n:"Jorge Burruchaga",pos:["CM","LW"],r:78},
  {n:"Néstor Fabbri",pos:["LW","CM"],r:70},{n:"Abel Balbo",pos:["ST","LW"],r:74},
  {n:"Gustavo Dezotti",pos:["ST","LW"],r:72},{n:"Claudio Caniggia",pos:["LW","ST"],r:85},
  {n:"Diego Maradona",pos:["CAM","LW"],r:93}
 ]},
  {y:1974,p:[
  {n:"Ubaldo Fillol",pos:["GK"],r:80},{n:"Daniel Carnevali",pos:["GK"],r:74},{n:"Rubén Glaria",pos:["GK"],r:70},
  {n:"Roberto Perfumo",pos:["CB"],r:79},{n:"Enrique Wolff",pos:["CB"],r:74},
  {n:"Jorge Carrascosa",pos:["CB","CDM"],r:73},{n:"Carlos Squeo",pos:["CB","RB"],r:72},
  {n:"Ángel Bargas",pos:["LB","CB"],r:71},{n:"Agustín Balbuena",pos:["LB"],r:70},
  {n:"Roberto Telch",pos:["CDM","CM"],r:72},{n:"Miguel Ángel Brindisi",pos:["CM","CAM"],r:75},
  {n:"Carlos Babington",pos:["CM","CAM"],r:74},{n:"Ramón Heredia",pos:["CM","CDM"],r:71},
  {n:"Francisco Sá",pos:["CM","CDM"],r:71},{n:"Néstor Togneri",pos:["LW","CM"],r:70},
  {n:"Enrique Chazarreta",pos:["CM"],r:70},{n:"René Houseman",pos:["LW","RW"],r:76},
  {n:"Rubén Ayala",pos:["LW","ST"],r:74},{n:"Aldo Poy",pos:["ST","LW"],r:71},
  {n:"Héctor Yazalde",pos:["ST"],r:76},{n:"Miguel Ángel Santoro",pos:["ST","LW"],r:72},
  {n:"Mario Kempes",pos:["ST","LW"],r:82}
 ]},
  {y:1978,p:[
  {n:"Ubaldo Fillol",pos:["GK"],r:83},{n:"Héctor Baley",pos:["GK"],r:73},{n:"Ricardo La Volpe",pos:["GK"],r:72},
  {n:"Jorge Olguín",pos:["RB","CB"],r:75},{n:"Daniel Passarella",pos:["CB"],r:85},
  {n:"Luis Galván",pos:["CB"],r:77},{n:"Daniel Killer",pos:["CB"],r:73},
  {n:"Alberto Tarantini",pos:["LB","CB"],r:75},{n:"Rubén Pagnanini",pos:["LB","CB"],r:70},
  {n:"Américo Gallego",pos:["CDM","CM"],r:76},{n:"Osvaldo Ardiles",pos:["CM","CDM"],r:83},
  {n:"Rubén Galván",pos:["CM","CDM"],r:72},{n:"Miguel Oviedo",pos:["CM","CDM"],r:71},
  {n:"Norberto Alonso",pos:["CAM","LW"],r:77},{n:"Omar Larrosa",pos:["CM","LW"],r:72},
  {n:"René Houseman",pos:["LW","RW"],r:76},{n:"Daniel Bertoni",pos:["RW","LW"],r:76},
  {n:"José Daniel Valencia",pos:["LW","CM"],r:70},{n:"Oscar Ortiz",pos:["LW","ST"],r:72},
  {n:"Ricardo Villa",pos:["CM","LW"],r:76},{n:"Leopoldo Luque",pos:["ST"],r:79},
  {n:"Mario Kempes",pos:["ST","LW"],r:88}
 ]}
 ],
 "Spain":[
  ,
  {y:2018,p:[
  {n:"David de Gea",pos:["GK"],r:89},
  {n:"Kepa Arrizabalaga",pos:["GK"],r:81},
  {n:"Pepe Reina",pos:["GK"],r:78},
  {n:"Dani Carvajal",pos:["RB","RWB"],r:85},
  {n:"Alvaro Odriozola",pos:["RB","RWB"],r:74},
  {n:"Gerard Pique",pos:["CB"],r:87},
  {n:"Sergio Ramos",pos:["CB","RB"],r:90},
  {n:"Nacho",pos:["CB","RB","LB"],r:81},
  {n:"Nacho Monreal",pos:["LB","CB"],r:80},
  {n:"Cesar Azpilicueta",pos:["RB","CB","LB"],r:83},
  {n:"Jordi Alba",pos:["LB","LWB"],r:86},
  {n:"Sergio Busquets",pos:["CDM","CM"],r:89},
  {n:"Saul",pos:["CM","CDM","LM"],r:79},
  {n:"Koke",pos:["CM","CAM","RW"],r:82},
  {n:"Andres Iniesta",pos:["CAM","CM","LW"],r:89},
  {n:"Thiago",pos:["CM","CAM"],r:86},
  {n:"David Silva",pos:["CAM","CM","LW"],r:88},
  {n:"Isco",pos:["CAM","CM"],r:84},
  {n:"Marco Asensio",pos:["LW","CAM","RW"],r:82},
  {n:"Lucas Vazquez",pos:["RW","RB"],r:78},
  {n:"Diego Costa",pos:["ST"],r:83},
  {n:"Rodrigo",pos:["ST","LW"],r:78},
  {n:"Iago Aspas",pos:["ST","LW","CAM"],r:82}
 ]},
  {y:2022,p:[
  {n:"Unai Simon",pos:["GK"],r:82},
  {n:"David Raya",pos:["GK"],r:83},
  {n:"Robert Sanchez",pos:["GK"],r:78},
  {n:"Dani Carvajal",pos:["RB","RWB"],r:84},
  {n:"Cesar Azpilicueta",pos:["RB","CB"],r:80},
  {n:"Aymeric Laporte",pos:["CB","LB"],r:84},
  {n:"Pau Torres",pos:["CB","LB"],r:80},
  {n:"Eric Garcia",pos:["CB"],r:77},
  {n:"Hugo Guillamont",pos:["CB","CDM"],r:73},
  {n:"Jordi Alba",pos:["LB","LWB"],r:83},
  {n:"Alejandro Balde",pos:["LB","LWB"],r:77},
  {n:"Rodri",pos:["CDM","CM"],r:91},
  {n:"Sergio Busquets",pos:["CDM","CM"],r:85},
  {n:"Marcos Llorente",pos:["CM","RB","LB"],r:80},
  {n:"Koke",pos:["CM","CAM","RW"],r:81},
  {n:"Gavi",pos:["CM","CAM"],r:87},
  {n:"Pedri",pos:["CM","CAM"],r:88},
  {n:"Dani Olmo",pos:["CAM","LW","CM"],r:82},
  {n:"Carlos Soler",pos:["CM","CAM"],r:77},
  {n:"Pablo Sarabia",pos:["RW","CAM","LW"],r:79},
  {n:"Marco Asensio",pos:["LW","CAM","RW"],r:81},
  {n:"Nico Williams",pos:["LW","RW"],r:79},
  {n:"Ferran Torres",pos:["LW","ST","RW"],r:79},
  {n:"Ansu Fati",pos:["LW","ST"],r:78},
  {n:"Yeremy Pino",pos:["RW","LW"],r:75},
  {n:"Alvaro Morata",pos:["ST"],r:81}
 ]},
  {y:2006,p:[
  {n:"Iker Casillas",pos:["GK"],r:90},{n:"Santiago Cañizares",pos:["GK"],r:79},{n:"Pepe Reina",pos:["GK"],r:79},
  {n:"Míchel Salgado",pos:["RB","CM"],r:74},{n:"Carlos Marchena",pos:["CB"],r:78},
  {n:"Carles Puyol",pos:["CB"],r:87},{n:"Pablo Ibáñez",pos:["CB"],r:75},
  {n:"Mariano Pernía",pos:["LB","LWB"],r:74},{n:"Antonio López",pos:["RB","CB"],r:73},
  {n:"David Albelda",pos:["CDM","CM"],r:78},{n:"Marcos Senna",pos:["CDM","CM"],r:78},
  {n:"Xabi Alonso",pos:["CM","CDM"],r:86},{n:"Cesc Fàbregas",pos:["CM","CAM"],r:82},
  {n:"Luis García",pos:["CM","CAM"],r:75},{n:"Joaquín",pos:["RW","LW"],r:76},
  {n:"Andrés Iniesta",pos:["CM","CAM"],r:86},{n:"Xavi",pos:["CM","CAM"],r:88},
  {n:"José Antonio Reyes",pos:["LW","CAM"],r:77},{n:"Juanito",pos:["LW","LM"],r:72},
  {n:"Raúl",pos:["ST","CAM"],r:84},{n:"David Villa",pos:["ST","LW"],r:86},
  {n:"Fernando Torres",pos:["ST","LW"],r:85}
 ]},
  {y:2010,p:[
  {n:"Iker Casillas",pos:["GK"],r:92},{n:"Pepe Reina",pos:["GK"],r:80},{n:"Víctor Valdés",pos:["GK"],r:82},
  {n:"Sergio Ramos",pos:["CB","RB"],r:87},{n:"Carles Puyol",pos:["CB"],r:86},
  {n:"Carlos Marchena",pos:["CB"],r:76},{n:"Raúl Albiol",pos:["CB"],r:77},
  {n:"Gerard Piqué",pos:["CB"],r:84},{n:"Joan Capdevila",pos:["LB","LWB"],r:77},
  {n:"Álvaro Arbeloa",pos:["RB","CB"],r:76},{n:"Sergio Busquets",pos:["CDM","CM"],r:85},
  {n:"Xabi Alonso",pos:["CM","CDM"],r:88},{n:"Javi Martínez",pos:["CDM","CM"],r:78},
  {n:"Cesc Fàbregas",pos:["CM","CAM"],r:85},{n:"David Silva",pos:["CAM","CM","LW"],r:87},
  {n:"Andrés Iniesta",pos:["CM","CAM"],r:90},{n:"Xavi",pos:["CM","CAM"],r:91},
  {n:"Juan Mata",pos:["CAM","LW"],r:80},{n:"Jesús Navas",pos:["RW","LW"],r:77},
  {n:"Pedro",pos:["LW","RW","ST"],r:80},{n:"Fernando Llorente",pos:["ST"],r:77},
  {n:"Fernando Torres",pos:["ST","LW"],r:87},{n:"David Villa",pos:["ST","LW"],r:90}
 ]},
  {y:2014,p:[
  {n:"Iker Casillas",pos:["GK"],r:88},{n:"David de Gea",pos:["GK"],r:87},{n:"Pepe Reina",pos:["GK"],r:78},
  {n:"Juanfran",pos:["RB","RWB"],r:77},{n:"Gerard Piqué",pos:["CB"],r:86},
  {n:"Sergio Ramos",pos:["CB","RB"],r:90},{n:"Raúl Albiol",pos:["CB"],r:78},
  {n:"César Azpilicueta",pos:["RB","CB","LB"],r:81},{n:"Jordi Alba",pos:["LB","LWB"],r:86},
  {n:"Javi Martínez",pos:["CDM","CM"],r:80},{n:"Sergio Busquets",pos:["CDM","CM"],r:88},
  {n:"Xabi Alonso",pos:["CM","CDM"],r:87},{n:"Cesc Fàbregas",pos:["CM","CAM"],r:85},
  {n:"Koke",pos:["CM","CAM","RW"],r:80},{n:"Juan Mata",pos:["CAM","LW"],r:82},
  {n:"Andrés Iniesta",pos:["CM","CAM"],r:91},{n:"Xavi",pos:["CM","CAM"],r:89},
  {n:"Santi Cazorla",pos:["CAM","CM"],r:82},{n:"Pedro",pos:["LW","RW","ST"],r:79},
  {n:"Diego Costa",pos:["ST"],r:83},{n:"David Villa",pos:["ST","LW"],r:85},
  {n:"Fernando Torres",pos:["ST","LW"],r:82}
 ]},
  {y:1994,p:[
  {n:"Andoni Zubizarreta",pos:["GK"],r:84},{n:"Julen Lopetegui",pos:["GK"],r:76},{n:"Santiago Cañizares",pos:["GK"],r:76},
  {n:"Albert Ferrer",pos:["RB","CB"],r:76},{n:"Rafael Alkorta",pos:["CB"],r:79},
  {n:"Fernando Hierro",pos:["CB","CDM"],r:86},{n:"Andoni Goikoetxea",pos:["CB"],r:72},
  {n:"Miguel Ángel Nadal",pos:["CB","CDM"],r:78},{n:"Sergi",pos:["LB","LWB"],r:75},
  {n:"Felipe Miñambres",pos:["RB","CM"],r:71},{n:"Jorge Otero",pos:["CDM","CM"],r:71},
  {n:"Josep Guardiola",pos:["CDM","CM"],r:82},{n:"José María Bakero",pos:["CM","CAM"],r:77},
  {n:"Txiki Begiristain",pos:["LW","CAM"],r:76},{n:"Paco Camarasa",pos:["CM","LW"],r:70},
  {n:"Voro",pos:["CM","CDM"],r:70},{n:"Julen Guerrero",pos:["LW","RW"],r:77},
  {n:"José Luis Caminero",pos:["CM","CAM"],r:78},{n:"Luis Enrique",pos:["CM","ST"],r:83},
  {n:"Julio Salinas",pos:["ST","LW"],r:74},{n:"Juanele",pos:["ST","LW"],r:70},
  {n:"David Villa",pos:["ST"],r:72}
 ]},
  {y:1998,p:[
  {n:"Andoni Zubizarreta",pos:["GK"],r:81},{n:"Santiago Cañizares",pos:["GK"],r:78},{n:"José Molina",pos:["GK"],r:74},
  {n:"Albert Ferrer",pos:["RB","CB"],r:75},{n:"Fernando Hierro",pos:["CB","CDM"],r:85},
  {n:"Rafael Alkorta",pos:["CB"],r:76},{n:"Agustín Aranzábal",pos:["CB","LB"],r:73},
  {n:"Miguel Ángel Nadal",pos:["CB","CDM"],r:76},{n:"Sergi",pos:["LB","LWB"],r:74},
  {n:"Carlos Aguilera",pos:["RB","CM"],r:70},{n:"Guillermo Amor",pos:["CDM","CM"],r:76},
  {n:"Albert Celades",pos:["CM","CDM"],r:74},{n:"Iván Campo",pos:["CDM","CM"],r:73},
  {n:"Abelardo",pos:["CB"],r:79},{n:"Kiko",pos:["LW","ST"],r:74},
  {n:"Luis Enrique",pos:["CM","ST"],r:82},{n:"Joseba Etxeberria",pos:["LW","CM"],r:74},
  {n:"Julen Guerrero",pos:["LW","RW"],r:76},{n:"Alfonso",pos:["ST","LW"],r:74},
  {n:"Juan Antonio Pizzi",pos:["ST","LW"],r:73},{n:"Fernando Morientes",pos:["ST"],r:80},
  {n:"Raúl",pos:["ST","CAM"],r:87}
 ]},
  {y:2002,p:[
  {n:"Iker Casillas",pos:["GK"],r:85},{n:"Ricardo",pos:["GK"],r:74},{n:"Pedro Contreras",pos:["GK"],r:73},
  {n:"Juanfran",pos:["RB","CB"],r:73},{n:"Fernando Hierro",pos:["CB","CDM"],r:83},
  {n:"Iván Helguera",pos:["CB"],r:77},{n:"Carles Puyol",pos:["CB"],r:83},
  {n:"Miguel Ángel Nadal",pos:["CB","CDM"],r:74},{n:"Curro Torres",pos:["LB","CB"],r:72},
  {n:"David Albelda",pos:["CDM","CM"],r:77},{n:"Sergio",pos:["CDM","CM"],r:70},
  {n:"Rubén Baraja",pos:["CM","CDM"],r:75},{n:"Javier de Pedro",pos:["CM","LW"],r:71},
  {n:"Gaizka Mendieta",pos:["CM","RW"],r:79},{n:"Enrique Romero",pos:["CM"],r:69},
  {n:"Juan Carlos Valerón",pos:["CAM","CM"],r:80},{n:"Joaquín",pos:["RW","LW"],r:76},
  {n:"Diego Tristán",pos:["ST","LW"],r:73},{n:"Albert Luque",pos:["LW","ST"],r:73},
  {n:"Fernando Morientes",pos:["ST"],r:82},{n:"Raúl",pos:["ST","CAM"],r:88},
  {n:"Luis Enrique",pos:["CM","ST"],r:79},{n:"Xavi",pos:["CM","CAM"],r:82}
 ]},
  {y:1982,p:[
  {n:"Luis Arconada",pos:["GK"],r:83},{n:"Miguel Ángel",pos:["GK"],r:78},{n:"Urruti",pos:["GK"],r:74},
  {n:"Antonio Maceda",pos:["CB","CDM"],r:75},{n:"José Ramón Alexanko",pos:["CB"],r:74},
  {n:"Miguel Tendillo",pos:["CB"],r:73},{n:"José Antonio Camacho",pos:["LB","CB"],r:79},
  {n:"Rafael Gordillo",pos:["LB","LWB"],r:78},{n:"Santiago Urquiaga",pos:["RB","CB"],r:71},
  {n:"Ricardo Gallego",pos:["CDM","CM"],r:73},{n:"Periko Alonso",pos:["CM","CDM"],r:73},
  {n:"Manuel Jiménez",pos:["CM","CDM"],r:72},{n:"Enrique Saura",pos:["CM","LW"],r:70},
  {n:"Tente Sánchez",pos:["CM","LW"],r:70},{n:"Pedro Uralde",pos:["LW","CM"],r:70},
  {n:"Roberto López Ufarte",pos:["LW","RW"],r:72},{n:"Joaquín",pos:["RW","LW"],r:71},
  {n:"Santillana",pos:["ST"],r:79},{n:"Jesús María Satrústegui",pos:["ST","LW"],r:72},
  {n:"Quini",pos:["ST","LW"],r:79},{n:"Juanito",pos:["CAM","LW"],r:78},
  {n:"Jesús María Zamora",pos:["LW","ST"],r:70}
 ]},
  {y:1986,p:[
  {n:"Andoni Zubizarreta",pos:["GK"],r:83},{n:"Juan Carlos Ablanedo",pos:["GK"],r:73},{n:"Hipólito Rincón",pos:["GK"],r:72},
  {n:"Chendo",pos:["RB","RWB"],r:74},{n:"Antonio Maceda",pos:["CB"],r:74},
  {n:"Tomás",pos:["CB"],r:72},{n:"Ricardo Gallego",pos:["CDM","CB"],r:72},
  {n:"José Antonio Camacho",pos:["LB","CB"],r:78},{n:"Julio Alberto",pos:["LB","LWB"],r:73},
  {n:"Francisco José Carrasco",pos:["CDM","CM"],r:73},{n:"Michel",pos:["CM","CAM"],r:79},
  {n:"Quique Setién",pos:["CM","CDM"],r:73},{n:"Andoni Goikoetxea",pos:["CM","CDM"],r:72},
  {n:"Francisco",pos:["CM","LW"],r:70},{n:"Rafael Gordillo",pos:["LB","LWB"],r:77},
  {n:"Ramón Calderé",pos:["CM","LW"],r:72},{n:"Víctor",pos:["LW","ST"],r:72},
  {n:"Juan Antonio Señor",pos:["LW","ST"],r:72},{n:"Julio Salinas",pos:["ST","LW"],r:73},
  {n:"Urruti",pos:["GK"],r:73},{n:"Eloy",pos:["ST","LW"],r:71},
  {n:"Emilio Butragueño",pos:["ST","CAM"],r:84}
 ]},
  {y:1990,p:[
  {n:"Andoni Zubizarreta",pos:["GK"],r:85},{n:"Juan Carlos Ablanedo",pos:["GK"],r:72},{n:"José Manuel Ochotorena",pos:["GK"],r:73},
  {n:"Chendo",pos:["RB","RWB"],r:73},{n:"Fernando Hierro",pos:["CB","CDM"],r:83},
  {n:"Manuel Sanchís",pos:["CB"],r:78},{n:"Rafael Alkorta",pos:["CB"],r:77},
  {n:"Alberto Górriz",pos:["CB","LB"],r:72},{n:"Francisco Villarroya",pos:["LB","LWB"],r:72},
  {n:"Rafael Martín Vázquez",pos:["CM","CAM"],r:78},{n:"Míchel",pos:["CM","CAM"],r:80},
  {n:"Julio Salinas",pos:["ST","LW"],r:74},{n:"José María Bakero",pos:["CM","CAM"],r:77},
  {n:"Manuel Jiménez",pos:["CM","CDM"],r:71},{n:"Quique Sánchez Flores",pos:["CM"],r:70},
  {n:"Fernando",pos:["LW","CM"],r:70},{n:"Genar Andrinúa",pos:["LW","ST"],r:71},
  {n:"Miguel Pardeza",pos:["LW","ST"],r:72},{n:"Manolo",pos:["CM","LW"],r:70},
  {n:"Rafael Paz",pos:["LW","ST"],r:70},{n:"Roberto",pos:["CM","LW"],r:70},
  {n:"Emilio Butragueño",pos:["ST","CAM"],r:82}
 ]}
 ],
 "Italy":[
  ,
  {y:2006,p:[
  {n:"Gianluigi Buffon",pos:["GK"],r:93},{n:"Angelo Peruzzi",pos:["GK"],r:76},{n:"Marco Amelia",pos:["GK"],r:73},
  {n:"Massimo Oddo",pos:["RB","RWB"],r:76},{n:"Alessandro Nesta",pos:["CB"],r:90},
  {n:"Fabio Cannavaro",pos:["CB"],r:91},{n:"Marco Materazzi",pos:["CB"],r:79},
  {n:"Cristian Zaccardo",pos:["RB","CB"],r:74},{n:"Andrea Barzagli",pos:["CB"],r:79},
  {n:"Fabio Grosso",pos:["LB","LWB"],r:78},{n:"Gianluca Zambrotta",pos:["RB","LB"],r:83},
  {n:"Andrea Pirlo",pos:["CDM","CM"],r:89},{n:"Gennaro Gattuso",pos:["CDM","CM"],r:83},
  {n:"Mauro Camoranesi",pos:["CM","RW"],r:78},{n:"Daniele De Rossi",pos:["CM","CDM"],r:84},
  {n:"Simone Barone",pos:["CM","CDM"],r:72},{n:"Simone Perrotta",pos:["CM","LW"],r:76},
  {n:"Francesco Totti",pos:["CAM","ST"],r:90},{n:"Vincenzo Iaquinta",pos:["ST","RW"],r:74},
  {n:"Filippo Inzaghi",pos:["ST"],r:82},{n:"Alberto Gilardino",pos:["ST"],r:79},
  {n:"Luca Toni",pos:["ST"],r:83},{n:"Alessandro Del Piero",pos:["CAM","ST"],r:88}
 ]},
  {y:2010,p:[
  {n:"Gianluigi Buffon",pos:["GK"],r:91},{n:"Federico Marchetti",pos:["GK"],r:75},{n:"Morgan De Sanctis",pos:["GK"],r:77},
  {n:"Christian Maggio",pos:["RB","RWB"],r:74},{n:"Fabio Cannavaro",pos:["CB"],r:84},
  {n:"Giorgio Chiellini",pos:["CB","LB"],r:83},{n:"Gianluca Zambrotta",pos:["RB","LB"],r:79},
  {n:"Leonardo Bonucci",pos:["CB"],r:80},{n:"Domenico Criscito",pos:["LB","CB"],r:74},
  {n:"Salvatore Bocchetti",pos:["CB"],r:72},{n:"Angelo Palombo",pos:["CDM","CM"],r:73},
  {n:"Gennaro Gattuso",pos:["CDM","CM"],r:81},{n:"Andrea Pirlo",pos:["CDM","CM"],r:88},
  {n:"Riccardo Montolivo",pos:["CM","CAM"],r:77},{n:"Claudio Marchisio",pos:["CM","CDM"],r:80},
  {n:"Daniele De Rossi",pos:["CM","CDM"],r:85},{n:"Mauro Camoranesi",pos:["CM","RW"],r:75},
  {n:"Simone Pepe",pos:["RW","LW"],r:73},{n:"Alberto Gilardino",pos:["ST"],r:76},
  {n:"Antonio Di Natale",pos:["ST"],r:80},{n:"Giampaolo Pazzini",pos:["ST"],r:76},
  {n:"Fabio Quagliarella",pos:["ST","LW"],r:76},{n:"Vincenzo Iaquinta",pos:["ST","RW"],r:73}
 ]},
  {y:2014,p:[
  {n:"Gianluigi Buffon",pos:["GK"],r:91},{n:"Salvatore Sirigu",pos:["GK"],r:78},{n:"Mattia Perin",pos:["GK"],r:74},
  {n:"Mattia De Sciglio",pos:["RB","LB"],r:76},{n:"Andrea Barzagli",pos:["CB"],r:83},
  {n:"Leonardo Bonucci",pos:["CB"],r:85},{n:"Giorgio Chiellini",pos:["CB"],r:87},
  {n:"Ignazio Abate",pos:["RB","CB"],r:75},{n:"Gabriel Paletta",pos:["CB"],r:73},
  {n:"Matteo Darmian",pos:["LB","RB"],r:76},{n:"Marco Parolo",pos:["CM","CDM"],r:75},
  {n:"Daniele De Rossi",pos:["CM","CDM"],r:86},{n:"Andrea Pirlo",pos:["CDM","CM"],r:88},
  {n:"Claudio Marchisio",pos:["CM","CDM"],r:82},{n:"Marco Verratti",pos:["CM","CDM"],r:82},
  {n:"Thiago Motta",pos:["CDM","CM"],r:77},{n:"Antonio Candreva",pos:["RW","LW","RB"],r:77},
  {n:"Lorenzo Insigne",pos:["LW","CAM"],r:80},{n:"Alberto Aquilani",pos:["CM","CAM"],r:74},
  {n:"Alessio Cerci",pos:["LW","RW"],r:74},{n:"Antonio Cassano",pos:["CAM","ST"],r:79},
  {n:"Ciro Immobile",pos:["ST"],r:78},{n:"Mario Balotelli",pos:["ST"],r:84}
 ]},
  {y:1994,p:[
  {n:"Gianluca Pagliuca",pos:["GK"],r:84},{n:"Luca Marchegiani",pos:["GK"],r:79},{n:"Luca Bucci",pos:["GK"],r:74},
  {n:"Mauro Tassotti",pos:["RB","CB"],r:79},{n:"Franco Baresi",pos:["CB"],r:91},
  {n:"Alessandro Costacurta",pos:["CB"],r:86},{n:"Luigi Apolloni",pos:["CB"],r:76},
  {n:"Lorenzo Minotti",pos:["CB"],r:75},{n:"Antonio Benarrivo",pos:["LB","LWB"],r:75},
  {n:"Roberto Mussi",pos:["RB","CB"],r:73},{n:"Demetrio Albertini",pos:["CM","CDM"],r:80},
  {n:"Dino Baggio",pos:["CM","CDM"],r:77},{n:"Nicola Berti",pos:["CM","CDM"],r:76},
  {n:"Roberto Donadoni",pos:["CM","RW"],r:77},{n:"Antonio Conte",pos:["CM","CDM"],r:76},
  {n:"Alberigo Evani",pos:["CM","LW"],r:73},{n:"Gianfranco Zola",pos:["CAM","ST"],r:83},
  {n:"Giuseppe Signori",pos:["LW","ST"],r:82},{n:"Daniele Massaro",pos:["ST","LW"],r:75},
  {n:"Paolo Maldini",pos:["LB","CB"],r:91},{n:"Pierluigi Casiraghi",pos:["ST"],r:74},
  {n:"Roberto Baggio",pos:["CAM","ST"],r:92}
 ]},
  {y:1998,p:[
  {n:"Gianluca Pagliuca",pos:["GK"],r:83},{n:"Francesco Toldo",pos:["GK"],r:79},{n:"Gianluigi Buffon",pos:["GK"],r:80},
  {n:"Gianluca Pessotto",pos:["RB","LB"],r:75},{n:"Alessandro Costacurta",pos:["CB"],r:84},
  {n:"Fabio Cannavaro",pos:["CB"],r:83},{n:"Giuseppe Bergomi",pos:["CB"],r:77},
  {n:"Paolo Maldini",pos:["LB","CB"],r:92},{n:"Moreno Torricelli",pos:["RB","CB"],r:73},
  {n:"Dino Baggio",pos:["CM","CDM"],r:76},{n:"Demetrio Albertini",pos:["CM","CDM"],r:80},
  {n:"Luigi Di Biagio",pos:["CM","CDM"],r:75},{n:"Roberto Di Matteo",pos:["CM","CDM"],r:78},
  {n:"Angelo Di Livio",pos:["CM","RW"],r:74},{n:"Francesco Moriero",pos:["LW","RW"],r:73},
  {n:"Alessandro Nesta",pos:["CB"],r:82},{n:"Sandro Cois",pos:["CM"],r:70},
  {n:"Enrico Chiesa",pos:["LW","ST"],r:75},{n:"Filippo Inzaghi",pos:["ST"],r:82},
  {n:"Alessandro Del Piero",pos:["CAM","ST"],r:87},{n:"Roberto Baggio",pos:["CAM","ST"],r:86},
  {n:"Christian Vieri",pos:["ST"],r:87}
 ]},
  {y:2002,p:[
  {n:"Gianluigi Buffon",pos:["GK"],r:90},{n:"Francesco Toldo",pos:["GK"],r:80},{n:"Christian Abbiati",pos:["GK"],r:74},
  {n:"Gianluca Zambrotta",pos:["RB","LB"],r:82},{n:"Alessandro Nesta",pos:["CB"],r:87},
  {n:"Fabio Cannavaro",pos:["CB"],r:86},{n:"Marco Materazzi",pos:["CB"],r:77},
  {n:"Christian Panucci",pos:["RB","CB"],r:76},{n:"Francesco Coco",pos:["LB","LWB"],r:73},
  {n:"Paolo Maldini",pos:["LB","CB"],r:90},{n:"Gennaro Gattuso",pos:["CDM","CM"],r:80},
  {n:"Damiano Tommasi",pos:["CDM","CM"],r:75},{n:"Luigi Di Biagio",pos:["CM","CDM"],r:73},
  {n:"Cristiano Doni",pos:["CM"],r:70},{n:"Cristiano Zanetti",pos:["CM","CDM"],r:71},
  {n:"Angelo Di Livio",pos:["CM","RW"],r:72},{n:"Mark Iuliano",pos:["CB"],r:72},
  {n:"Marco Delvecchio",pos:["ST","LW"],r:73},{n:"Vincenzo Montella",pos:["ST","LW"],r:78},
  {n:"Filippo Inzaghi",pos:["ST"],r:82},{n:"Francesco Totti",pos:["CAM","ST"],r:89},
  {n:"Christian Vieri",pos:["ST"],r:87},{n:"Alessandro Del Piero",pos:["CAM","ST"],r:87}
 ]},
  {y:1982,p:[
  {n:"Dino Zoff",pos:["GK"],r:88},{n:"Ivano Bordon",pos:["GK"],r:80},{n:"Giovanni Galli",pos:["GK"],r:78},
  {n:"Giuseppe Bergomi",pos:["CB","RB"],r:80},{n:"Gaetano Scirea",pos:["CB"],r:86},
  {n:"Claudio Gentile",pos:["CB"],r:81},{n:"Fulvio Collovati",pos:["CB"],r:78},
  {n:"Antonio Cabrini",pos:["LB","LWB"],r:82},{n:"Pietro Vierchowod",pos:["CB"],r:76},
  {n:"Giampiero Marini",pos:["CDM","CM"],r:74},{n:"Gabriele Oriali",pos:["CDM","CM"],r:76},
  {n:"Marco Tardelli",pos:["CM","CDM"],r:83},{n:"Franco Causio",pos:["CM","RW"],r:77},
  {n:"Giuseppe Dossena",pos:["CM","LW"],r:72},{n:"Franco Baresi",pos:["CB","CDM"],r:82},
  {n:"Giancarlo Antognoni",pos:["CAM","CM"],r:83},{n:"Bruno Conti",pos:["RW","LW"],r:80},
  {n:"Franco Selvaggi",pos:["LW","ST"],r:70},{n:"Daniele Massaro",pos:["ST","LW"],r:73},
  {n:"Francesco Graziani",pos:["ST","LW"],r:77},{n:"Alessandro Altobelli",pos:["ST"],r:80},
  {n:"Paolo Rossi",pos:["ST"],r:87}
 ]},
  {y:1986,p:[
  {n:"Giovanni Galli",pos:["GK"],r:79},{n:"Walter Zenga",pos:["GK"],r:80},{n:"Franco Tancredi",pos:["GK"],r:74},
  {n:"Giuseppe Bergomi",pos:["CB","RB"],r:82},{n:"Gaetano Scirea",pos:["CB"],r:83},
  {n:"Fulvio Collovati",pos:["CB"],r:76},{n:"Pietro Vierchowod",pos:["CB"],r:78},
  {n:"Antonio Cabrini",pos:["LB","LWB"],r:80},{n:"Sebastiano Nela",pos:["LB","CB"],r:72},
  {n:"Roberto Tricella",pos:["CDM","CB"],r:72},{n:"Salvatore Bagni",pos:["CDM","CM"],r:73},
  {n:"Fernando De Napoli",pos:["CM","CDM"],r:77},{n:"Antonio Di Gennaro",pos:["CM","CDM"],r:74},
  {n:"Marco Tardelli",pos:["CM","CDM"],r:80},{n:"Bruno Conti",pos:["RW","LW"],r:78},
  {n:"Carlo Ancelotti",pos:["CM","CAM"],r:80},{n:"Giuseppe Galderisi",pos:["LW","ST"],r:71},
  {n:"Giuseppe Baresi",pos:["CB","CDM"],r:73},{n:"Aldo Serena",pos:["ST","LW"],r:72},
  {n:"Alessandro Altobelli",pos:["ST"],r:79},{n:"Gianluca Vialli",pos:["ST","LW"],r:79},
  {n:"Paolo Rossi",pos:["ST"],r:81}
 ]},
  {y:1990,p:[
  {n:"Walter Zenga",pos:["GK"],r:83},{n:"Giovanni Galli",pos:["GK"],r:74},{n:"Stefano Tacconi",pos:["GK"],r:78},
  {n:"Gianluca Pagliuca",pos:["GK"],r:79},{n:"Giuseppe Bergomi",pos:["CB"],r:83},
  {n:"Franco Baresi",pos:["CB"],r:91},{n:"Pietro Vierchowod",pos:["CB"],r:79},
  {n:"Paolo Maldini",pos:["LB","CB"],r:87},{n:"Ciro Ferrara",pos:["CB","LB"],r:76},
  {n:"Riccardo Ferri",pos:["CB"],r:74},{n:"Luigi De Agostini",pos:["LB","CDM"],r:73},
  {n:"Carlo Ancelotti",pos:["CM","CAM"],r:79},{n:"Fernando De Napoli",pos:["CM","CDM"],r:76},
  {n:"Roberto Donadoni",pos:["CM","RW"],r:78},{n:"Nicola Berti",pos:["CM","CDM"],r:76},
  {n:"Giancarlo Marocchi",pos:["CM","CDM"],r:74},{n:"Giuseppe Giannini",pos:["CAM","CM"],r:78},
  {n:"Roberto Mancini",pos:["CAM","LW"],r:78},{n:"Andrea Carnevale",pos:["ST","LW"],r:73},
  {n:"Aldo Serena",pos:["ST","LW"],r:72},{n:"Gianluca Vialli",pos:["ST","LW"],r:84},
  {n:"Roberto Baggio",pos:["CAM","ST"],r:84},{n:"Salvatore Schillaci",pos:["ST"],r:82}
 ]},
  {y:1970,p:[
  {n:"Enrico Albertosi",pos:["GK"],r:82},{n:"Dino Zoff",pos:["GK"],r:84},{n:"Lido Vieri",pos:["GK"],r:73},
  {n:"Tarcisio Burgnich",pos:["RB","CB"],r:82},{n:"Roberto Rosato",pos:["CB"],r:76},
  {n:"Pierluigi Cera",pos:["CB"],r:74},{n:"Comunardo Niccolai",pos:["CB"],r:73},
  {n:"Giacinto Facchetti",pos:["LB","LWB"],r:87},{n:"Ugo Ferrante",pos:["LB","CB"],r:70},
  {n:"Mario Bertini",pos:["CDM","CM"],r:73},{n:"Giancarlo De Sisti",pos:["CM","CDM"],r:77},
  {n:"Antonio Juliano",pos:["CM","CDM"],r:76},{n:"Giuseppe Furino",pos:["CM","CDM"],r:73},
  {n:"Fabrizio Poletti",pos:["CM"],r:70},{n:"Giorgio Puia",pos:["CB","CM"],r:70},
  {n:"Angelo Domenghini",pos:["RW","CM"],r:76},{n:"Sandro Mazzola",pos:["CAM","CM"],r:85},
  {n:"Gianni Rivera",pos:["CAM","CM"],r:87},{n:"Pierino Prati",pos:["LW","ST"],r:78},
  {n:"Sergio Gori",pos:["ST"],r:71},{n:"Roberto Boninsegna",pos:["ST"],r:80},
  {n:"Gigi Riva",pos:["LW","ST"],r:88}
 ]},
  {y:1974,p:[
  {n:"Dino Zoff",pos:["GK"],r:87},{n:"Enrico Albertosi",pos:["GK"],r:79},{n:"Luciano Castellini",pos:["GK"],r:74},
  {n:"Tarcisio Burgnich",pos:["RB","CB"],r:80},{n:"Giacinto Facchetti",pos:["LB","LWB"],r:84},
  {n:"Francesco Morini",pos:["CB"],r:74},{n:"Mauro Bellugi",pos:["CB"],r:75},
  {n:"Giuseppe Wilson",pos:["CB"],r:73},{n:"Luciano Spinosi",pos:["CB","LB"],r:72},
  {n:"Romeo Benetti",pos:["CDM","CM"],r:76},{n:"Antonio Juliano",pos:["CM","CDM"],r:74},
  {n:"Luciano Re Cecconi",pos:["CM","CDM"],r:73},{n:"Fabio Capello",pos:["CM","CAM"],r:80},
  {n:"Franco Causio",pos:["CM","RW"],r:76},{n:"Giuseppe Sabadini",pos:["CM","CDM"],r:71},
  {n:"Sandro Mazzola",pos:["CAM","CM"],r:83},{n:"Gianni Rivera",pos:["CAM","CM"],r:84},
  {n:"Giorgio Chinaglia",pos:["ST"],r:80},{n:"Roberto Boninsegna",pos:["ST"],r:77},
  {n:"Paolo Pulici",pos:["ST","LW"],r:76},{n:"Pietro Anastasi",pos:["ST"],r:76},
  {n:"Gigi Riva",pos:["LW","ST"],r:83}
 ]},
  {y:1978,p:[
  {n:"Dino Zoff",pos:["GK"],r:90},{n:"Ivano Bordon",pos:["GK"],r:78},{n:"Paolo Conti",pos:["GK"],r:72},
  {n:"Antonello Cuccureddu",pos:["RB","CB"],r:76},{n:"Gaetano Scirea",pos:["CB"],r:84},
  {n:"Claudio Gentile",pos:["CB"],r:80},{n:"Mauro Bellugi",pos:["CB"],r:74},
  {n:"Antonio Cabrini",pos:["LB","LWB"],r:79},{n:"Aldo Maldera",pos:["LB","CB"],r:72},
  {n:"Romeo Benetti",pos:["CDM","CM"],r:76},{n:"Renato Zaccarelli",pos:["CM","CDM"],r:73},
  {n:"Eraldo Pecci",pos:["CM","CDM"],r:73},{n:"Marco Tardelli",pos:["CM","CDM"],r:80},
  {n:"Franco Causio",pos:["CM","RW"],r:76},{n:"Lionello Manfredonia",pos:["CM","CDM"],r:72},
  {n:"Giancarlo Antognoni",pos:["CAM","CM"],r:82},{n:"Claudio Sala",pos:["LW","CAM"],r:74},
  {n:"Patrizio Sala",pos:["LW","CM"],r:71},{n:"Francesco Graziani",pos:["ST","LW"],r:77},
  {n:"Paolo Pulici",pos:["ST"],r:77},{n:"Roberto Bettega",pos:["ST","LW"],r:80},
  {n:"Paolo Rossi",pos:["ST"],r:83}
 ]},
  {y:1966,p:[
  {n:"Enrico Albertosi",pos:["GK"],r:80},{n:"Roberto Anzolin",pos:["GK"],r:74},{n:"Pierluigi Pizzaballa",pos:["GK"],r:72},
  {n:"Tarcisio Burgnich",pos:["RB","CB"],r:80},{n:"Giacinto Facchetti",pos:["LB","LWB"],r:85},
  {n:"Aristide Guarneri",pos:["CB"],r:74},{n:"Roberto Rosato",pos:["CB"],r:73},
  {n:"Sandro Salvadore",pos:["CB"],r:72},{n:"Francesco Janich",pos:["CB","LB"],r:71},
  {n:"Romano Fogli",pos:["CDM","CM"],r:71},{n:"Giacomo Bulgarelli",pos:["CM","CDM"],r:77},
  {n:"Antonio Juliano",pos:["CM","CDM"],r:75},{n:"Giovanni Lodetti",pos:["CM","CDM"],r:73},
  {n:"Gianfranco Leoncini",pos:["CM","LW"],r:71},{n:"Francesco Rizzo",pos:["CM"],r:70},
  {n:"Spartaco Landini",pos:["LW","CM"],r:70},{n:"Luigi Meroni",pos:["LW","RW"],r:74},
  {n:"Marino Perani",pos:["LW","ST"],r:73},{n:"Ezio Pascutti",pos:["LW","ST"],r:72},
  {n:"Paolo Barison",pos:["ST"],r:73},{n:"Sandro Mazzola",pos:["CAM","CM"],r:83},
  {n:"Gianni Rivera",pos:["CAM","CM"],r:85}
 ]}
 ],
 "Portugal":[
  ,
  {y:2022,p:[{n:"Rui Patricio",pos:["GK"],r:82},{n:"Jose Sa",pos:["GK"],r:78},{n:"Diogo Costa",pos:["GK"],r:80},{n:"Joao Cancelo",pos:["RB","LB","LWB"],r:86},{n:"Ruben Dias",pos:["CB"],r:90},{n:"Pepe",pos:["CB"],r:79},{n:"Diogo Dalot",pos:["RB","LB"],r:80},{n:"Nuno Mendes",pos:["LB","LWB"],r:82},{n:"Antonio Silva",pos:["CB"],r:75},{n:"Bernardo Silva",pos:["CAM","RW","CM"],r:89},{n:"Bruno Fernandes",pos:["CAM","CM"],r:89},{n:"William Carvalho",pos:["CDM","CM"],r:79},{n:"Vitinha",pos:["CM","CDM"],r:82},{n:"Joao Palhinha",pos:["CDM","CM"],r:82},{n:"Cristiano Ronaldo",pos:["LW","ST","RW"],r:89},{n:"Rafael Leao",pos:["LW","ST"],r:84},{n:"Joao Felix",pos:["CAM","ST","LW"],r:85},{n:"Otavio",pos:["CM","RW"],r:76},{n:"Goncalo Ramos",pos:["ST"],r:81},{n:"Andre Silva",pos:["ST"],r:77},{n:"Ricardo Horta",pos:["LW","RW"],r:74},{n:"Matheus Nunes",pos:["CM","CDM"],r:77},{n:"Danilo Pereira",pos:["CDM","CB"],r:76}]},
  {y:2018,p:[
  {n:"Rui Patricio",pos:["GK"],r:83},
  {n:"Anthony Lopes",pos:["GK"],r:78},
  {n:"Beto",pos:["GK"],r:72},
  {n:"Cedric",pos:["RB","RWB"],r:77},
  {n:"Ricardo Pereira",pos:["RB","RWB"],r:79},
  {n:"Jose Fonte",pos:["CB"],r:79},
  {n:"Bruno Alves",pos:["CB"],r:78},
  {n:"Pepe",pos:["CB"],r:82},
  {n:"Ruben Dias",pos:["CB"],r:78},
  {n:"Mario Rui",pos:["LB","LWB"],r:77},
  {n:"Raphael Guerreiro",pos:["LB","LWB","CM"],r:80},
  {n:"William Carvalho",pos:["CDM","CM"],r:80},
  {n:"Adrien Silva",pos:["CM","CDM"],r:76},
  {n:"Joao Moutinho",pos:["CM","CDM"],r:82},
  {n:"Joao Mario",pos:["CM","LW","CAM"],r:77},
  {n:"Manuel Fernandes",pos:["CM","CAM"],r:72},
  {n:"Bernardo Silva",pos:["CAM","RW","CM"],r:85},
  {n:"Bruno Fernandes",pos:["CAM","CM"],r:82},
  {n:"Gelson Martins",pos:["RW","LW"],r:76},
  {n:"Ricardo Quaresma",pos:["RW","LW"],r:77},
  {n:"Goncalo Guedes",pos:["LW","RW","CAM"],r:77},
  {n:"Cristiano Ronaldo",pos:["LW","ST","RW"],r:95},
  {n:"Andre Silva",pos:["ST"],r:77}
 ]},
  {y:2006,p:[
  {n:"Ricardo",pos:["GK"],r:79},{n:"Quim",pos:["GK"],r:75},{n:"Paulo Santos",pos:["GK"],r:71},
  {n:"Paulo Ferreira",pos:["RB","RWB"],r:77},{n:"Marco Caneira",pos:["CB","RB"],r:72},
  {n:"Fernando Meira",pos:["CB"],r:76},{n:"Ricardo Carvalho",pos:["CB"],r:86},
  {n:"Nuno Valente",pos:["LB","LWB"],r:75},{n:"Miguel",pos:["RB","RWB"],r:76},
  {n:"Costinha",pos:["CDM","CM"],r:76},{n:"Petit",pos:["CDM","CM"],r:73},
  {n:"Maniche",pos:["CM","CAM"],r:79},{n:"Tiago",pos:["CM","CDM"],r:79},
  {n:"Luís Boa Morte",pos:["LW","CM"],r:74},{n:"Hugo Viana",pos:["CM","CAM"],r:72},
  {n:"Deco",pos:["CAM","CM"],r:87},{n:"Luís Figo",pos:["RW","CAM"],r:87},
  {n:"Simão",pos:["LW","RW"],r:80},{n:"Ricardo Costa",pos:["CB"],r:72},
  {n:"Hélder Postiga",pos:["ST"],r:74},{n:"Pauleta",pos:["ST"],r:81},
  {n:"Nuno Gomes",pos:["ST"],r:77},{n:"Cristiano Ronaldo",pos:["LW","RW","ST"],r:86}
 ]},
  {y:2010,p:[
  {n:"Beto",pos:["GK"],r:73},{n:"Daniel Fernandes",pos:["GK"],r:70},{n:"Eduardo",pos:["GK"],r:76},
  {n:"Paulo Ferreira",pos:["RB","RWB"],r:76},{n:"Ricardo Costa",pos:["CB","RB"],r:73},
  {n:"Bruno Alves",pos:["CB"],r:80},{n:"Ricardo Carvalho",pos:["CB"],r:84},
  {n:"Rolando",pos:["CB"],r:73},{n:"Fábio Coentrão",pos:["LB","LWB"],r:79},
  {n:"Miguel Veloso",pos:["CM","CDM"],r:77},{n:"Pedro Mendes",pos:["CDM","CM"],r:71},
  {n:"Rúben Amorim",pos:["CM","CDM"],r:73},{n:"Tiago",pos:["CM","CDM"],r:78},
  {n:"Deco",pos:["CAM","CM"],r:83},{n:"Simão",pos:["LW","RW"],r:77},
  {n:"Danny",pos:["LW","CAM"],r:76},{n:"Duda",pos:["CM","LW"],r:74},
  {n:"Miguel",pos:["RB","RWB"],r:73},{n:"Hugo Almeida",pos:["ST"],r:73},
  {n:"Liédson",pos:["ST","LW"],r:72},{n:"Raul Meireles",pos:["CM","CDM"],r:79},
  {n:"Pepe",pos:["CB"],r:84},{n:"Cristiano Ronaldo",pos:["LW","RW","ST"],r:92}
 ]},
  {y:2014,p:[
  {n:"Rui Patrício",pos:["GK"],r:82},{n:"Beto",pos:["GK"],r:73},{n:"Eduardo",pos:["GK"],r:73},
  {n:"João Pereira",pos:["RB","RWB"],r:73},{n:"Bruno Alves",pos:["CB"],r:79},
  {n:"Pepe",pos:["CB"],r:85},{n:"Ricardo Costa",pos:["CB"],r:73},
  {n:"André Almeida",pos:["RB","CB"],r:73},{n:"Luís Neto",pos:["CB"],r:72},
  {n:"Fábio Coentrão",pos:["LB","LWB"],r:78},{n:"Rúben Amorim",pos:["CM","CDM"],r:71},
  {n:"Raul Meireles",pos:["CM","CDM"],r:78},{n:"William Carvalho",pos:["CDM","CM"],r:78},
  {n:"João Moutinho",pos:["CM","CDM"],r:81},{n:"Miguel Veloso",pos:["CM","CDM"],r:74},
  {n:"Vieirinha",pos:["RW","LW","RB"],r:73},{n:"Nani",pos:["LW","RW"],r:80},
  {n:"Rafa Silva",pos:["LW","RW"],r:72},{n:"Silvestre Varela",pos:["LW","RW"],r:72},
  {n:"Eder",pos:["ST","LW"],r:73},{n:"Hélder Postiga",pos:["ST"],r:72},
  {n:"Hugo Almeida",pos:["ST"],r:72},{n:"Cristiano Ronaldo",pos:["LW","RW","ST"],r:94}
 ]},
  {y:2002,p:[
  {n:"Vítor Baía",pos:["GK"],r:83},{n:"Ricardo",pos:["GK"],r:77},{n:"Beto",pos:["GK"],r:72},
  {n:"Paulo Ferreira",pos:["RB","RWB"],r:75},{n:"Fernando Couto",pos:["CB"],r:81},
  {n:"Jorge Andrade",pos:["CB"],r:77},{n:"Jorge Costa",pos:["CB"],r:73},
  {n:"Abel Xavier",pos:["RB","CB"],r:73},{n:"Rui Jorge",pos:["LB","LWB"],r:73},
  {n:"Marco Caneira",pos:["RB","CB"],r:71},{n:"Paulo Sousa",pos:["CDM","CM"],r:78},
  {n:"Paulo Bento",pos:["CM","CDM"],r:73},{n:"Petit",pos:["CDM","CM"],r:73},
  {n:"João Pinto",pos:["CM","LW"],r:73},{n:"Sérgio Conceição",pos:["LW","RW"],r:76},
  {n:"Capucho",pos:["LW","RW"],r:75},{n:"Hugo Viana",pos:["CM","LW"],r:72},
  {n:"Pedro Barbosa",pos:["LW","CM"],r:70},{n:"Nuno Frechaut",pos:["LW","CM"],r:70},
  {n:"Rui Costa",pos:["CAM","CM"],r:86},{n:"Nuno Gomes",pos:["ST"],r:77},
  {n:"Pauleta",pos:["ST"],r:80},{n:"Luís Figo",pos:["RW","CAM"],r:92}
 ]}
 ],
 "England":[
  {y:2018,p:[{n:"Jordan Pickford",pos:["GK"],r:80},{n:"Jack Butland",pos:["GK"],r:76},{n:"Nick Pope",pos:["GK"],r:76},{n:"Kyle Walker",pos:["RB","RWB","CB"],r:84},{n:"Harry Maguire",pos:["CB"],r:83},{n:"John Stones",pos:["CB"],r:82},{n:"Kieran Trippier",pos:["RB","RWB"],r:80},{n:"Phil Jones",pos:["CB"],r:73},{n:"Ashley Young",pos:["LB","LWB","LW"],r:78},{n:"Jordan Henderson",pos:["CM","CDM"],r:81},{n:"Fabian Delph",pos:["LB","CM","CDM"],r:76},{n:"Eric Dier",pos:["CDM","CB"],r:77},{n:"Ruben Loftus-Cheek",pos:["CM","CAM"],r:76},{n:"Dele Alli",pos:["CAM","CM"],r:83},{n:"Raheem Sterling",pos:["LW","ST","RW"],r:84},{n:"Jesse Lingard",pos:["CAM","RW","LW"],r:79},{n:"Danny Rose",pos:["LB","LWB"],r:76},{n:"Harry Kane",pos:["ST"],r:88},{n:"Jamie Vardy",pos:["ST","LW"],r:82},{n:"Marcus Rashford",pos:["LW","ST"],r:81},{n:"Danny Welbeck",pos:["ST","LW"],r:74},{n:"Gary Cahill",pos:["CB"],r:78},{n:"Lewis Cook",pos:["CM","CDM"],r:70}]},
  {y:2022,p:[
  {n:"Jordan Pickford",pos:["GK"],r:83},
  {n:"Nick Pope",pos:["GK"],r:80},
  {n:"Aaron Ramsdale",pos:["GK"],r:78},
  {n:"Trent Alexander-Arnold",pos:["RB","RWB","CM"],r:86},
  {n:"Kyle Walker",pos:["RB","RWB","CB"],r:85},
  {n:"Ben White",pos:["CB","RB"],r:80},
  {n:"Harry Maguire",pos:["CB"],r:80},
  {n:"John Stones",pos:["CB"],r:83},
  {n:"Conor Coady",pos:["CB"],r:77},
  {n:"Eric Dier",pos:["CB","CDM"],r:77},
  {n:"Kieran Trippier",pos:["RB","RWB","LB"],r:82},
  {n:"Luke Shaw",pos:["LB","LWB"],r:82},
  {n:"Declan Rice",pos:["CDM","CM"],r:86},
  {n:"Jordan Henderson",pos:["CM","CDM"],r:80},
  {n:"Kalvin Phillips",pos:["CDM","CM"],r:79},
  {n:"Jude Bellingham",pos:["CM","CAM"],r:86},
  {n:"Mason Mount",pos:["CAM","CM","LW"],r:82},
  {n:"Conor Gallagher",pos:["CM","CAM"],r:77},
  {n:"James Maddison",pos:["CAM","CM"],r:82},
  {n:"Phil Foden",pos:["LW","CAM","RW"],r:88},
  {n:"Bukayo Saka",pos:["RW","LW"],r:86},
  {n:"Raheem Sterling",pos:["LW","RW","ST"],r:84},
  {n:"Jack Grealish",pos:["LW","CAM"],r:82},
  {n:"Marcus Rashford",pos:["LW","ST"],r:84},
  {n:"Callum Wilson",pos:["ST"],r:77},
  {n:"Harry Kane",pos:["ST"],r:91}
 ]},
  {y:2006,p:[
  {n:"Paul Robinson",pos:["GK"],r:79},{n:"David James",pos:["GK"],r:78},{n:"Scott Carson",pos:["GK"],r:72},
  {n:"Gary Neville",pos:["RB","CB"],r:80},{n:"Rio Ferdinand",pos:["CB"],r:88},
  {n:"John Terry",pos:["CB"],r:89},{n:"Sol Campbell",pos:["CB"],r:83},
  {n:"Ashley Cole",pos:["LB","LWB"],r:87},{n:"Wayne Bridge",pos:["LB"],r:76},
  {n:"Michael Carrick",pos:["CM","CDM"],r:78},{n:"Owen Hargreaves",pos:["CDM","CM"],r:78},
  {n:"Jamie Carragher",pos:["CB","CDM"],r:82},{n:"Jermaine Jenas",pos:["CM","CDM"],r:74},
  {n:"Frank Lampard",pos:["CM","CAM"],r:89},{n:"Steven Gerrard",pos:["CM","CAM"],r:90},
  {n:"David Beckham",pos:["CM","RW"],r:84},{n:"Joe Cole",pos:["LW","CAM"],r:79},
  {n:"Stewart Downing",pos:["LW","LM"],r:74},{n:"Aaron Lennon",pos:["RW","LW"],r:75},
  {n:"Theo Walcott",pos:["RW","LW"],r:73},{n:"Michael Owen",pos:["ST"],r:82},
  {n:"Peter Crouch",pos:["ST"],r:76},{n:"Wayne Rooney",pos:["ST","LW"],r:87}
 ]},
  {y:2010,p:[
  {n:"David James",pos:["GK"],r:77},{n:"Robert Green",pos:["GK"],r:74},{n:"Joe Hart",pos:["GK"],r:80},
  {n:"Glen Johnson",pos:["RB","RWB"],r:79},{n:"Rio Ferdinand",pos:["CB"],r:86},
  {n:"John Terry",pos:["CB"],r:87},{n:"Matthew Upson",pos:["CB"],r:76},
  {n:"Ashley Cole",pos:["LB","LWB"],r:86},{n:"Stephen Warnock",pos:["LB"],r:72},
  {n:"Michael Carrick",pos:["CM","CDM"],r:78},{n:"Gareth Barry",pos:["CDM","CM"],r:78},
  {n:"Michael Dawson",pos:["CB"],r:75},{n:"Jamie Carragher",pos:["CB","CDM"],r:80},
  {n:"Ledley King",pos:["CB"],r:78},{n:"James Milner",pos:["CM","RW"],r:76},
  {n:"Frank Lampard",pos:["CM","CAM"],r:87},{n:"Steven Gerrard",pos:["CM","CAM"],r:88},
  {n:"Aaron Lennon",pos:["RW","LW"],r:75},{n:"Joe Cole",pos:["LW","CAM"],r:76},
  {n:"Shaun Wright-Phillips",pos:["RW","LW"],r:73},{n:"Peter Crouch",pos:["ST"],r:75},
  {n:"Jermain Defoe",pos:["ST"],r:78},{n:"Wayne Rooney",pos:["ST","LW"],r:89},
  {n:"Emile Heskey",pos:["ST"],r:74}
 ]},
  {y:2014,p:[
  {n:"Joe Hart",pos:["GK"],r:82},{n:"Ben Foster",pos:["GK"],r:79},{n:"Fraser Forster",pos:["GK"],r:75},
  {n:"Glen Johnson",pos:["RB","RWB"],r:77},{n:"Phil Jagielka",pos:["CB"],r:78},
  {n:"Gary Cahill",pos:["CB"],r:80},{n:"Phil Jones",pos:["CB"],r:74},
  {n:"Chris Smalling",pos:["CB"],r:77},{n:"Leighton Baines",pos:["LB","LWB"],r:80},
  {n:"Luke Shaw",pos:["LB","LWB"],r:77},{n:"Jordan Henderson",pos:["CM","CDM"],r:78},
  {n:"Frank Lampard",pos:["CM","CAM"],r:83},{n:"Jack Wilshere",pos:["CM","CAM"],r:79},
  {n:"James Milner",pos:["CM","RW"],r:76},{n:"Ross Barkley",pos:["CM","CAM"],r:76},
  {n:"Alex Oxlade-Chamberlain",pos:["CM","LW"],r:74},{n:"Adam Lallana",pos:["CAM","CM"],r:77},
  {n:"Raheem Sterling",pos:["LW","RW","ST"],r:78},{n:"Danny Welbeck",pos:["LW","ST"],r:76},
  {n:"Rickie Lambert",pos:["ST"],r:74},{n:"Daniel Sturridge",pos:["ST","LW"],r:83},
  {n:"Wayne Rooney",pos:["ST","CAM"],r:87},{n:"Steven Gerrard",pos:["CM","CAM"],r:83}
 ]},
  {y:1998,p:[
  {n:"David Seaman",pos:["GK"],r:85},{n:"Nigel Martyn",pos:["GK"],r:79},{n:"Tim Flowers",pos:["GK"],r:75},
  {n:"Gary Neville",pos:["RB","CB"],r:81},{n:"Tony Adams",pos:["CB"],r:85},
  {n:"Martin Keown",pos:["CB"],r:79},{n:"Sol Campbell",pos:["CB"],r:82},
  {n:"Gareth Southgate",pos:["CB"],r:78},{n:"Graeme Le Saux",pos:["LB","LWB"],r:76},
  {n:"Rob Lee",pos:["CM","CDM"],r:73},{n:"Paul Ince",pos:["CDM","CM"],r:80},
  {n:"David Batty",pos:["CDM","CM"],r:77},{n:"Paul Scholes",pos:["CM","CAM"],r:82},
  {n:"Darren Anderton",pos:["CM","RW"],r:76},{n:"Steve McManaman",pos:["LW","CM"],r:78},
  {n:"Paul Merson",pos:["LW","CAM"],r:75},{n:"David Beckham",pos:["CM","RW"],r:82},
  {n:"Rio Ferdinand",pos:["CB"],r:79},{n:"Alan Shearer",pos:["ST"],r:90},
  {n:"Les Ferdinand",pos:["ST"],r:78},{n:"Teddy Sheringham",pos:["ST","CAM"],r:80},
  {n:"Michael Owen",pos:["ST"],r:82}
 ]},
  {y:2002,p:[
  {n:"David Seaman",pos:["GK"],r:83},{n:"Nigel Martyn",pos:["GK"],r:78},{n:"David James",pos:["GK"],r:76},
  {n:"Danny Mills",pos:["RB","CB"],r:74},{n:"Rio Ferdinand",pos:["CB"],r:84},
  {n:"Sol Campbell",pos:["CB"],r:84},{n:"Martin Keown",pos:["CB"],r:76},
  {n:"Gareth Southgate",pos:["CB"],r:76},{n:"Ashley Cole",pos:["LB","LWB"],r:82},
  {n:"Wayne Bridge",pos:["LB","LWB"],r:75},{n:"Wes Brown",pos:["CB","RB"],r:73},
  {n:"Owen Hargreaves",pos:["CDM","CM"],r:75},{n:"Nicky Butt",pos:["CDM","CM"],r:76},
  {n:"Paul Scholes",pos:["CM","CAM"],r:85},{n:"Kieron Dyer",pos:["CM","LW"],r:76},
  {n:"David Beckham",pos:["CM","RW"],r:85},{n:"Joe Cole",pos:["LW","CAM"],r:76},
  {n:"Trevor Sinclair",pos:["LW","CM"],r:73},{n:"Emile Heskey",pos:["ST","LW"],r:76},
  {n:"Robbie Fowler",pos:["ST"],r:78},{n:"Teddy Sheringham",pos:["ST","CAM"],r:78},
  {n:"Darius Vassell",pos:["ST","LW"],r:73},{n:"Michael Owen",pos:["ST"],r:86}
 ]},
  {y:1982,p:[
  {n:"Peter Shilton",pos:["GK"],r:88},{n:"Ray Clemence",pos:["GK"],r:85},{n:"Joe Corrigan",pos:["GK"],r:78},
  {n:"Mick Mills",pos:["RB","CB"],r:76},{n:"Phil Thompson",pos:["CB"],r:78},
  {n:"Terry Butcher",pos:["CB"],r:82},{n:"Phil Neal",pos:["RB","CB"],r:79},
  {n:"Kenny Sansom",pos:["LB","LWB"],r:80},{n:"Viv Anderson",pos:["RB","CB"],r:76},
  {n:"Ray Wilkins",pos:["CDM","CM"],r:80},{n:"Bryan Robson",pos:["CM","CDM"],r:87},
  {n:"Terry McDermott",pos:["CM","CAM"],r:76},{n:"Graham Rix",pos:["LW","CM"],r:74},
  {n:"Steve Coppell",pos:["RW","CM"],r:76},{n:"Glenn Hoddle",pos:["CM","CAM"],r:83},
  {n:"Trevor Brooking",pos:["CAM","CM"],r:78},{n:"Steve Foster",pos:["CB"],r:72},
  {n:"Tony Woodcock",pos:["ST","LW"],r:75},{n:"Peter Withe",pos:["ST"],r:74},
  {n:"Paul Mariner",pos:["ST"],r:76},{n:"Kevin Keegan",pos:["ST","CAM"],r:85},
  {n:"Trevor Francis",pos:["ST","LW"],r:80}
 ]},
  {y:1986,p:[
  {n:"Peter Shilton",pos:["GK"],r:86},{n:"Gary Bailey",pos:["GK"],r:75},{n:"Chris Woods",pos:["GK"],r:77},
  {n:"Gary Stevens",pos:["RB","RWB"],r:79},{n:"Terry Butcher",pos:["CB"],r:83},
  {n:"Terry Fenwick",pos:["CB"],r:75},{n:"Alvin Martin",pos:["CB","CDM"],r:74},
  {n:"Kenny Sansom",pos:["LB","LWB"],r:79},{n:"Viv Anderson",pos:["RB","CB"],r:74},
  {n:"Ray Wilkins",pos:["CDM","CM"],r:78},{n:"Bryan Robson",pos:["CM","CDM"],r:86},
  {n:"Peter Reid",pos:["CDM","CM"],r:78},{n:"Steve Hodge",pos:["CM","LW"],r:74},
  {n:"Glenn Hoddle",pos:["CM","CAM"],r:82},{n:"Trevor Steven",pos:["RW","CM"],r:76},
  {n:"Chris Waddle",pos:["LW","RW"],r:79},{n:"John Barnes",pos:["LW","LM"],r:83},
  {n:"Mark Hateley",pos:["ST"],r:74},{n:"Kerry Dixon",pos:["ST"],r:74},
  {n:"Peter Beardsley",pos:["ST","CAM"],r:82},{n:"Gary Stevens",pos:["CM","LW"],r:75},
  {n:"Gary Lineker",pos:["ST"],r:88}
 ]},
  {y:1990,p:[
  {n:"Peter Shilton",pos:["GK"],r:84},{n:"Chris Woods",pos:["GK"],r:78},{n:"David Seaman",pos:["GK"],r:80},
  {n:"Gary Stevens",pos:["RB","RWB"],r:77},{n:"Terry Butcher",pos:["CB"],r:80},
  {n:"Mark Wright",pos:["CB"],r:78},{n:"Des Walker",pos:["CB"],r:80},
  {n:"Stuart Pearce",pos:["LB","LWB"],r:81},{n:"Tony Dorigo",pos:["LB","LWB"],r:73},
  {n:"Steve McMahon",pos:["CDM","CM"],r:76},{n:"Bryan Robson",pos:["CM","CDM"],r:83},
  {n:"Neil Webb",pos:["CM","CDM"],r:74},{n:"Steve Hodge",pos:["CM","LW"],r:74},
  {n:"Paul Parker",pos:["RB","CM"],r:74},{n:"Trevor Steven",pos:["CM","RW"],r:75},
  {n:"Chris Waddle",pos:["LW","RW"],r:80},{n:"John Barnes",pos:["LW","LM"],r:83},
  {n:"David Platt",pos:["CM","CAM"],r:78},{n:"Steve Bull",pos:["ST"],r:74},
  {n:"Peter Beardsley",pos:["ST","CAM"],r:82},{n:"Paul Gascoigne",pos:["CM","CAM"],r:87},
  {n:"Gary Lineker",pos:["ST"],r:88}
 ]}
 ],
 "Netherlands":[,
  {y:2022,p:[
  {n:"Remko Pasveer",pos:["GK"],r:77},
  {n:"Justin Bijlow",pos:["GK"],r:78},
  {n:"Andries Noppert",pos:["GK"],r:74},
  {n:"Denzel Dumfries",pos:["RB","RWB"],r:84},
  {n:"Jeremie Frimpong",pos:["RB","RWB"],r:80},
  {n:"Stefan de Vrij",pos:["CB"],r:82},
  {n:"Matthijs de Ligt",pos:["CB"],r:86},
  {n:"Nathan Ake",pos:["CB","LB"],r:83},
  {n:"Virgil van Dijk",pos:["CB"],r:89},
  {n:"Jurrien Timber",pos:["CB","RB"],r:82},
  {n:"Tyrell Malacia",pos:["LB","LWB"],r:76},
  {n:"Daley Blind",pos:["LB","CB","CDM"],r:78},
  {n:"Frenkie de Jong",pos:["CM","CDM"],r:87},
  {n:"Marten de Roon",pos:["CDM","CM"],r:79},
  {n:"Davy Klaassen",pos:["CM","CAM"],r:75},
  {n:"Teun Koopmeiners",pos:["CM","CAM","CDM"],r:82},
  {n:"Kenneth Taylor",pos:["CM","CDM"],r:73},
  {n:"Xavi Simons",pos:["CAM","CM"],r:77},
  {n:"Noa Lang",pos:["LW","CAM"],r:77},
  {n:"Steven Berghuis",pos:["RW","CAM"],r:79},
  {n:"Steven Bergwijn",pos:["RW","LW"],r:79},
  {n:"Cody Gakpo",pos:["LW","ST"],r:83},
  {n:"Memphis Depay",pos:["ST","LW"],r:84},
  {n:"Vincent Janssen",pos:["ST"],r:74},
  {n:"Luuk de Jong",pos:["ST"],r:76},
  {n:"Wout Weghorst",pos:["ST"],r:77}
 ]},
  {y:2006,p:[
  {n:"Edwin van der Sar",pos:["GK"],r:86},{n:"Henk Timmer",pos:["GK"],r:74},{n:"Maarten Stekelenburg",pos:["GK"],r:77},
  {n:"Jan Kromkamp",pos:["RB","CB"],r:73},{n:"Joris Mathijsen",pos:["CB"],r:77},
  {n:"André Ooijer",pos:["CB"],r:76},{n:"Khalid Boulahrouz",pos:["CB","RB"],r:77},
  {n:"Tim de Cler",pos:["LB","CB"],r:72},{n:"Kew Jaliens",pos:["RB","CB"],r:71},
  {n:"Hedwiges Maduro",pos:["CDM","CM"],r:72},{n:"Denny Landzaat",pos:["CDM","CM"],r:74},
  {n:"Mark van Bommel",pos:["CDM","CM"],r:83},{n:"Phillip Cocu",pos:["CM","CDM"],r:79},
  {n:"Giovanni van Bronckhorst",pos:["LB","CM"],r:81},{n:"Rafael van der Vaart",pos:["CAM","CM"],r:82},
  {n:"Wesley Sneijder",pos:["CM","CAM"],r:82},{n:"Arjen Robben",pos:["RW","LW"],r:87},
  {n:"Ryan Babel",pos:["LW","ST"],r:77},{n:"Jan Vennegoor of Hesselink",pos:["ST"],r:75},
  {n:"Dirk Kuyt",pos:["ST","RW"],r:81},{n:"Ruud van Nistelrooy",pos:["ST"],r:88},
  {n:"Robin van Persie",pos:["ST","LW"],r:82}
 ]},
  {y:2010,p:[
  {n:"Maarten Stekelenburg",pos:["GK"],r:81},{n:"Sander Boschker",pos:["GK"],r:73},{n:"Michel Vorm",pos:["GK"],r:77},
  {n:"Gregory van der Wiel",pos:["RB","RWB"],r:79},{n:"Joris Mathijsen",pos:["CB"],r:76},
  {n:"Khalid Boulahrouz",pos:["CB","RB"],r:74},{n:"John Heitinga",pos:["CB","RB"],r:78},
  {n:"Giovanni van Bronckhorst",pos:["LB","CM"],r:79},{n:"Edson Braafheid",pos:["LB"],r:71},
  {n:"Stijn Schaars",pos:["CDM","CM"],r:72},{n:"Mark van Bommel",pos:["CDM","CM"],r:80},
  {n:"Nigel de Jong",pos:["CDM","CM"],r:79},{n:"André Ooijer",pos:["CB"],r:74},
  {n:"Demy de Zeeuw",pos:["CM","CDM"],r:73},{n:"Ibrahim Afellay",pos:["LW","CAM"],r:76},
  {n:"Rafael van der Vaart",pos:["CAM","CM"],r:82},{n:"Wesley Sneijder",pos:["CM","CAM"],r:87},
  {n:"Arjen Robben",pos:["RW","LW"],r:89},{n:"Eljero Elia",pos:["LW","RW"],r:74},
  {n:"Ryan Babel",pos:["LW","ST"],r:76},{n:"Klaas-Jan Huntelaar",pos:["ST"],r:82},
  {n:"Dirk Kuyt",pos:["ST","RW"],r:79},{n:"Robin van Persie",pos:["ST","LW"],r:86}
 ]},
  {y:2014,p:[
  {n:"Jasper Cillessen",pos:["GK"],r:78},{n:"Tim Krul",pos:["GK"],r:78},{n:"Michel Vorm",pos:["GK"],r:76},
  {n:"Daryl Janmaat",pos:["RB","CB"],r:76},{n:"Stefan de Vrij",pos:["CB"],r:80},
  {n:"Ron Vlaar",pos:["CB"],r:77},{n:"Joël Veltman",pos:["CB","RB"],r:74},
  {n:"Terence Kongolo",pos:["LB","CB"],r:73},{n:"Daley Blind",pos:["LB","CDM","CB"],r:79},
  {n:"Bruno Martins Indi",pos:["CB","LB"],r:76},{n:"Nigel de Jong",pos:["CDM","CM"],r:78},
  {n:"Jordy Clasie",pos:["CDM","CM"],r:74},{n:"Georginio Wijnaldum",pos:["CM","CAM"],r:81},
  {n:"Jonathan de Guzmán",pos:["CM","CDM"],r:73},{n:"Leroy Fer",pos:["CM","CDM"],r:74},
  {n:"Paul Verhaegh",pos:["RB","CM"],r:73},{n:"Memphis Depay",pos:["LW","ST"],r:78},
  {n:"Jeremain Lens",pos:["LW","RW"],r:75},{n:"Dirk Kuyt",pos:["ST","RW"],r:76},
  {n:"Klaas-Jan Huntelaar",pos:["ST"],r:80},{n:"Wesley Sneijder",pos:["CM","CAM"],r:84},
  {n:"Robin van Persie",pos:["ST","LW"],r:88},{n:"Arjen Robben",pos:["RW","LW"],r:89}
 ]},
  {y:1994,p:[
  {n:"Edwin van der Sar",pos:["GK"],r:79},{n:"Ed de Goey",pos:["GK"],r:78},{n:"Theo Snelders",pos:["GK"],r:75},
  {n:"John de Wolf",pos:["CB","RB"],r:76},{n:"Frank Rijkaard",pos:["CDM","CM"],r:84},
  {n:"Danny Blind",pos:["CB","CDM"],r:77},{n:"Stan Valckx",pos:["CB"],r:74},
  {n:"Ulrich van Gobbel",pos:["CB"],r:73},{n:"Arthur Numan",pos:["LB","LWB"],r:78},
  {n:"Jan Wouters",pos:["CDM","CM"],r:77},{n:"Rob Witschge",pos:["CM","CDM"],r:74},
  {n:"Wim Jonk",pos:["CM","CAM"],r:78},{n:"Aron Winter",pos:["CM","CDM"],r:76},
  {n:"Ronald de Boer",pos:["CM","CAM"],r:79},{n:"Frank de Boer",pos:["CB","CM"],r:80},
  {n:"Gaston Taument",pos:["LW","RW"],r:71},{n:"Marc Overmars",pos:["LW","RW"],r:83},
  {n:"Bryan Roy",pos:["LW","ST"],r:75},{n:"Peter van Vossen",pos:["ST","LW"],r:73},
  {n:"John Bosman",pos:["ST"],r:73},{n:"Ronald Koeman",pos:["CB","CDM"],r:85},
  {n:"Dennis Bergkamp",pos:["ST","CAM"],r:90}
 ]},
  {y:1998,p:[
  {n:"Edwin van der Sar",pos:["GK"],r:84},{n:"Ed de Goey",pos:["GK"],r:77},{n:"Ruud Hesp",pos:["GK"],r:74},
  {n:"Michael Reiziger",pos:["RB","CB"],r:79},{n:"Jaap Stam",pos:["CB"],r:87},
  {n:"Frank de Boer",pos:["CB"],r:82},{n:"André Ooijer",pos:["CB"],r:76},
  {n:"Giovanni van Bronckhorst",pos:["LB","CM"],r:80},{n:"Arthur Numan",pos:["LB","LWB"],r:79},
  {n:"Winston Bogarde",pos:["CB"],r:73},{n:"Philip Cocu",pos:["CM","CDM"],r:79},
  {n:"Clarence Seedorf",pos:["CM","CDM"],r:85},{n:"Edgar Davids",pos:["CDM","CM"],r:85},
  {n:"Wim Jonk",pos:["CM","CAM"],r:76},{n:"Aron Winter",pos:["CM","CDM"],r:74},
  {n:"Ronald de Boer",pos:["CM","CAM"],r:79},{n:"Boudewijn Zenden",pos:["LW","RW"],r:76},
  {n:"Marc Overmars",pos:["LW","RW"],r:85},{n:"Pierre van Hooijdonk",pos:["ST"],r:77},
  {n:"Jimmy Floyd Hasselbaink",pos:["ST"],r:83},{n:"Patrick Kluivert",pos:["ST"],r:84},
  {n:"Dennis Bergkamp",pos:["ST","CAM"],r:92}
 ]},
  {y:1990,p:[
  {n:"Hans van Breukelen",pos:["GK"],r:82},{n:"Stanley Menzo",pos:["GK"],r:75},{n:"Joop Hiele",pos:["GK"],r:70},
  {n:"Berry van Aerle",pos:["RB","CB"],r:74},{n:"Ronald Koeman",pos:["CB","CDM"],r:86},
  {n:"Frank Rijkaard",pos:["CDM","CM"],r:86},{n:"Danny Blind",pos:["CB"],r:76},
  {n:"Adri van Tiggelen",pos:["LB","CB"],r:73},{n:"Erwin Koeman",pos:["LB","CDM"],r:74},
  {n:"Graeme Rutjes",pos:["RB","CB"],r:71},{n:"Jan Wouters",pos:["CDM","CM"],r:76},
  {n:"Aron Winter",pos:["CM","CDM"],r:75},{n:"Henk Fraser",pos:["CM","CDM"],r:72},
  {n:"Gerald Vanenburg",pos:["CM","LW"],r:73},{n:"Richard Witschge",pos:["CM","CAM"],r:74},
  {n:"Bryan Roy",pos:["LW","ST"],r:75},{n:"John van 't Schip",pos:["CM","LW"],r:74},
  {n:"Hans Gillhaus",pos:["LW","ST"],r:73},{n:"John van Loen",pos:["ST"],r:71},
  {n:"Wim Kieft",pos:["ST"],r:76},{n:"Marco van Basten",pos:["ST"],r:92},
  {n:"Ruud Gullit",pos:["ST","CAM"],r:93}
 ]},
  {y:1974,p:[
  {n:"Jan Jongbloed",pos:["GK"],r:78},{n:"Piet Schrijvers",pos:["GK"],r:75},{n:"Eddy Treijtel",pos:["GK"],r:70},
  {n:"Wim Suurbier",pos:["RB","RWB"],r:78},{n:"Ruud Krol",pos:["CB","LB"],r:82},
  {n:"Rinus Israël",pos:["CB"],r:77},{n:"Wim Rijsbergen",pos:["CB"],r:75},
  {n:"Arie Haan",pos:["CM","CDM"],r:80},{n:"Wim Jansen",pos:["CM","CDM"],r:78},
  {n:"Johan Neeskens",pos:["CDM","CM"],r:86},{n:"Willem van Hanegem",pos:["CM","CAM"],r:82},
  {n:"René van de Kerkhof",pos:["RW","CM"],r:77},{n:"Willy van de Kerkhof",pos:["LW","CM"],r:76},
  {n:"Piet Keizer",pos:["LW","LM"],r:77},{n:"Theo de Jong",pos:["CM","CDM"],r:72},
  {n:"Harry Vos",pos:["CM","LW"],r:70},{n:"Pleun Strik",pos:["LB","CB"],r:70},
  {n:"Kees van Ierssel",pos:["CM","CDM"],r:70},{n:"Ruud Geels",pos:["ST"],r:77},
  {n:"Rob Rensenbrink",pos:["LW","ST"],r:83},{n:"Johnny Rep",pos:["RW","ST"],r:80},
  {n:"Johan Cruyff",pos:["ST","CAM"],r:96}
 ]},
  {y:1978,p:[
  {n:"Jan Jongbloed",pos:["GK"],r:78},{n:"Piet Schrijvers",pos:["GK"],r:75},{n:"Pim Doesburg",pos:["GK"],r:73},
  {n:"Wim Suurbier",pos:["RB","RWB"],r:76},{n:"Ruud Krol",pos:["CB","LB"],r:82},
  {n:"Wim Rijsbergen",pos:["CB"],r:75},{n:"Hugo Hovenkamp",pos:["CB"],r:73},
  {n:"Ernie Brandts",pos:["RB","CB"],r:75},{n:"Jan Poortvliet",pos:["LB","CB"],r:73},
  {n:"Johan Neeskens",pos:["CDM","CM"],r:84},{n:"Arie Haan",pos:["CM","CDM"],r:79},
  {n:"Wim Jansen",pos:["CM","CDM"],r:76},{n:"Johan Boskamp",pos:["CM","CDM"],r:71},
  {n:"Piet Wildschut",pos:["CM","LW"],r:70},{n:"Adrie van Kraay",pos:["LW","CM"],r:70},
  {n:"René van de Kerkhof",pos:["RW","CM"],r:77},{n:"Willy van de Kerkhof",pos:["LW","CM"],r:77},
  {n:"Harry Lubse",pos:["LW","RW"],r:70},{n:"Dick Nanninga",pos:["ST"],r:74},
  {n:"Dick Schoenaker",pos:["ST","LW"],r:70},{n:"Rob Rensenbrink",pos:["LW","ST"],r:84},
  {n:"Johnny Rep",pos:["RW","ST"],r:79}
 ]}
 ],
 "Uruguay":[
  ,
  {y:2018,p:[
  {n:"Fernando Muslera",pos:["GK"],r:82},
  {n:"Martin Campana",pos:["GK"],r:73},
  {n:"Martin Silva",pos:["GK"],r:74},
  {n:"Guillermo Varela",pos:["RB","RWB"],r:74},
  {n:"Maxi Pereira",pos:["RB","RWB"],r:77},
  {n:"Diego Godin",pos:["CB"],r:88},
  {n:"Sebastian Coates",pos:["CB"],r:76},
  {n:"Gaston Silva",pos:["CB","LB"],r:73},
  {n:"Jose Gimenez",pos:["CB"],r:81},
  {n:"Diego Laxalt",pos:["LB","LWB"],r:75},
  {n:"Cristian Rodriguez",pos:["LW","CM"],r:74},
  {n:"Carlos Sanchez",pos:["CDM","CM"],r:77},
  {n:"Lucas Torreira",pos:["CDM","CM"],r:79},
  {n:"Matias Vecino",pos:["CM","CDM"],r:79},
  {n:"Nahitan Nandez",pos:["CM","RW"],r:76},
  {n:"Rodrigo Bentancur",pos:["CM","CDM"],r:80},
  {n:"Giorgian De Arrascaeta",pos:["CAM","LW","CM"],r:80},
  {n:"Jonathan Urretaviscaya",pos:["LW","CM"],r:73},
  {n:"Cristhian Stuani",pos:["ST","RW"],r:77},
  {n:"Maxi Gomez",pos:["ST"],r:74},
  {n:"Edinson Cavani",pos:["ST","LW"],r:88},
  {n:"Luis Suarez",pos:["ST","LW"],r:92}
 ]},
  {y:2022,p:[
  {n:"Fernando Muslera",pos:["GK"],r:80},
  {n:"Sebastian Sosa",pos:["GK"],r:75},
  {n:"Sergio Rochet",pos:["GK"],r:76},
  {n:"Guillermo Varela",pos:["RB","RWB"],r:74},
  {n:"Ronald Araujo",pos:["CB","RB"],r:86},
  {n:"Sebastian Coates",pos:["CB"],r:77},
  {n:"Diego Godin",pos:["CB"],r:82},
  {n:"Jose Gimenez",pos:["CB"],r:82},
  {n:"Martin Caceres",pos:["CB","RB"],r:73},
  {n:"Matias Vina",pos:["LB","LWB"],r:76},
  {n:"Mathias Olivera",pos:["LB","LWB"],r:79},
  {n:"Rodrigo Bentancur",pos:["CM","CDM"],r:83},
  {n:"Federico Valverde",pos:["CM","CDM"],r:87},
  {n:"Lucas Torreira",pos:["CDM","CM"],r:80},
  {n:"Manuel Ugarte",pos:["CDM","CM"],r:79},
  {n:"Matias Vecino",pos:["CM","CDM"],r:78},
  {n:"Nicolas de la Cruz",pos:["CM","CAM","LW"],r:77},
  {n:"Giorgian De Arrascaeta",pos:["CAM","LW","CM"],r:81},
  {n:"Jose Luis Rodriguez",pos:["RW","LW"],r:72},
  {n:"Facundo Torres",pos:["LW","RW"],r:74},
  {n:"Agustin Canobbio",pos:["LW","ST"],r:73},
  {n:"Facundo Pellistri",pos:["RW","LW"],r:74},
  {n:"Darwin Nunez",pos:["ST","LW"],r:83},
  {n:"Edinson Cavani",pos:["ST","LW"],r:83},
  {n:"Maxi Gomez",pos:["ST"],r:74},
  {n:"Luis Suarez",pos:["ST","LW"],r:86}
 ]},
  {y:2026,p:[
  {n:"Fernando Muslera",pos:["GK"],r:78},{n:"Sergio Rochet",pos:["GK"],r:78},{n:"Santiago Mele",pos:["GK"],r:75},
  {n:"Guillermo Varela",pos:["RB","RWB"],r:74},{n:"Ronald Araujo",pos:["CB","RB"],r:88},
  {n:"Jose Gimenez",pos:["CB"],r:83},{n:"Sebastian Caceres",pos:["CB"],r:74},
  {n:"Santiago Bueno",pos:["CB"],r:75},{n:"Juan Manuel Sanabria",pos:["LB","CB"],r:71},
  {n:"Mathias Olivera",pos:["LB","LWB"],r:81},{n:"Maximiliano Araujo",pos:["LB","LWB"],r:77},
  {n:"Matias Vina",pos:["LB","LWB"],r:76},{n:"Federico Valverde",pos:["CM","CDM"],r:90},
  {n:"Rodrigo Bentancur",pos:["CM","CDM"],r:84},{n:"Manuel Ugarte",pos:["CDM","CM"],r:84},
  {n:"Lucas Torreira",pos:["CDM","CM"],r:80},{n:"Rodrigo Zalazar",pos:["CM","CAM"],r:74},
  {n:"Nicolas de la Cruz",pos:["CM","CAM","LW"],r:79},{n:"Giorgian de Arrascaeta",pos:["CAM","LW","CM"],r:83},
  {n:"Facundo Pellistri",pos:["RW","LW"],r:77},{n:"Brian Rodriguez",pos:["LW","RW"],r:75},
  {n:"Agustin Canobbio",pos:["LW","ST"],r:74},{n:"Federico Vinas",pos:["ST"],r:74},
  {n:"Rodrigo Aguirre",pos:["ST","LW"],r:74},{n:"Emiliano Martinez",pos:["LW","ST"],r:73},
  {n:"Darwin Nunez",pos:["ST","LW"],r:87}
 ]},
  {y:2010,p:[
  {n:"Fernando Muslera",pos:["GK"],r:80},{n:"Martín Silva",pos:["GK"],r:75},{n:"Juan Castillo",pos:["GK"],r:70},
  {n:"Maxi Pereira",pos:["RB","RWB"],r:76},{n:"Diego Lugano",pos:["CB"],r:81},
  {n:"Diego Godín",pos:["CB"],r:84},{n:"Andrés Scotti",pos:["CB"],r:73},
  {n:"Mauricio Victorino",pos:["CB"],r:72},{n:"Jorge Fucile",pos:["RB","CB"],r:72},
  {n:"Álvaro Fernández",pos:["LB","LWB"],r:71},{n:"Álvaro Pereira",pos:["LB","LWB"],r:74},
  {n:"Diego Pérez",pos:["CDM","CM"],r:76},{n:"Egidio Arévalo Ríos",pos:["CDM","CM"],r:74},
  {n:"Walter Gargano",pos:["CDM","CM"],r:74},{n:"Ignacio González",pos:["CM","CDM"],r:72},
  {n:"Nicolás Lodeiro",pos:["CM","CAM"],r:74},{n:"Cristian Rodríguez",pos:["LW","CM"],r:74},
  {n:"Sebastián Fernández",pos:["CAM","LW"],r:72},{n:"Sebastián Eguren",pos:["CM","CDM"],r:72},
  {n:"Sebastián Abreu",pos:["ST"],r:72},{n:"Edinson Cavani",pos:["ST","LW"],r:83},
  {n:"Diego Forlán",pos:["ST","CAM"],r:87},{n:"Luis Suárez",pos:["ST","LW"],r:87}
 ]},
  {y:2014,p:[
  {n:"Fernando Muslera",pos:["GK"],r:81},{n:"Martín Silva",pos:["GK"],r:75},{n:"Rodrigo Muñoz",pos:["GK"],r:71},
  {n:"Maxi Pereira",pos:["RB","RWB"],r:76},{n:"Diego Godín",pos:["CB"],r:87},
  {n:"Diego Lugano",pos:["CB"],r:78},{n:"Sebastián Coates",pos:["CB"],r:73},
  {n:"Álvaro González",pos:["CB"],r:71},{n:"Jorge Fucile",pos:["RB","CB"],r:71},
  {n:"Álvaro Pereira",pos:["LB","LWB"],r:73},{n:"Martín Cáceres",pos:["CB","RB"],r:75},
  {n:"Diego Pérez",pos:["CDM","CM"],r:74},{n:"Egidio Arévalo Ríos",pos:["CDM","CM"],r:73},
  {n:"Nicolás Lodeiro",pos:["CM","CAM"],r:74},{n:"Walter Gargano",pos:["CDM","CM"],r:73},
  {n:"Cristian Rodríguez",pos:["LW","CM"],r:73},{n:"Gastón Ramírez",pos:["CAM","LW"],r:74},
  {n:"Abel Hernández",pos:["ST","LW"],r:73},{n:"Cristhian Stuani",pos:["ST","LW"],r:74},
  {n:"Edinson Cavani",pos:["ST","LW"],r:88},{n:"Diego Forlán",pos:["ST","CAM"],r:82},
  {n:"José Giménez",pos:["CB"],r:76},{n:"Luis Suárez",pos:["ST","LW"],r:92}
 ]},
  {y:2002,p:[
  {n:"Gustavo Munúa",pos:["GK"],r:74},{n:"Fabián Carini",pos:["GK"],r:72},{n:"Alejandro Lembo",pos:["GK"],r:70},
  {n:"Darío Rodríguez",pos:["RB","CB"],r:73},{n:"Paolo Montero",pos:["CB"],r:78},
  {n:"Gonzalo Sorondo",pos:["CB"],r:72},{n:"Gonzalo de los Santos",pos:["CB","LB"],r:72},
  {n:"Darío Silva",pos:["LB","ST"],r:74},{n:"Federico Elduayen",pos:["LB","CB"],r:70},
  {n:"Gianni Guigou",pos:["CDM","CM"],r:71},{n:"Fabián O'Neill",pos:["CM","CDM"],r:73},
  {n:"Pablo García",pos:["CDM","CM"],r:74},{n:"Gustavo Méndez",pos:["CM","CDM"],r:70},
  {n:"Richard Morales",pos:["CM","LW"],r:70},{n:"Gustavo Varela",pos:["CM","LW"],r:71},
  {n:"Joe Bizera",pos:["CM"],r:70},{n:"Nicolás Olivera",pos:["LW","ST"],r:72},
  {n:"Mario Regueiro",pos:["CAM","CM"],r:72},{n:"Federico Magallanes",pos:["LW","ST"],r:70},
  {n:"Marcelo Romero",pos:["ST","LW"],r:70},{n:"Sebastián Abreu",pos:["ST"],r:73},
  {n:"Gustavo Méndez",pos:["LW","CM"],r:70},{n:"Álvaro Recoba",pos:["LW","CAM"],r:80},
  {n:"Diego Forlán",pos:["ST","LW"],r:78}
 ]},
  {y:1986,p:[
  {n:"Fernando Álvez",pos:["GK"],r:76},{n:"Eduardo Mario Acevedo",pos:["GK"],r:70},{n:"Celso Otero",pos:["GK"],r:70},
  {n:"Nelson Gutiérrez",pos:["RB","CB"],r:73},{n:"Jorge da Silva",pos:["CB"],r:72},
  {n:"José Batista",pos:["CB","CDM"],r:73},{n:"Miguel Bossio",pos:["CB","LB"],r:71},
  {n:"Jorge Barrios",pos:["LB","CB"],r:70},{n:"Darío Pereyra",pos:["LB","CM"],r:72},
  {n:"Wilmar Cabrera",pos:["CDM","CM"],r:72},{n:"Mario Saralegui",pos:["CM","CDM"],r:70},
  {n:"Sergio Santín",pos:["CM","CDM"],r:70},{n:"Carlos Aguilera",pos:["CM","LW"],r:73},
  {n:"Rubén Paz",pos:["CAM","CM"],r:76},{n:"Víctor Diogo",pos:["LW","CM"],r:71},
  {n:"Venancio Ramos",pos:["LW","ST"],r:70},{n:"César Vega",pos:["LW","ST"],r:70},
  {n:"Rodolfo Rodríguez",pos:["CM","CDM"],r:71},{n:"Antonio Alzamendi",pos:["ST","LW"],r:73},
  {n:"Eliseo Rivero",pos:["ST"],r:71},{n:"Enzo Francescoli",pos:["CAM","CM"],r:86},
  {n:"José Zalazar",pos:["LW","ST"],r:70}
 ]},
  {y:1990,p:[
  {n:"Fernando Álvez",pos:["GK"],r:74},{n:"José Pintos Saldanha",pos:["GK"],r:72},{n:"Javier Zeoli",pos:["GK"],r:70},
  {n:"Eduardo Pereira",pos:["RB","CB"],r:72},{n:"Nelson Gutiérrez",pos:["CB"],r:73},
  {n:"Hugo de León",pos:["CB"],r:74},{n:"José Oscar Herrera",pos:["CB","LB"],r:71},
  {n:"José Perdomo",pos:["LB","CB"],r:71},{n:"Daniel Revelez",pos:["LB"],r:70},
  {n:"Carlos Aguilera",pos:["CDM","CM"],r:72},{n:"Santiago Ostolaza",pos:["CM","CDM"],r:71},
  {n:"Sergio Martínez",pos:["CM","CDM"],r:70},{n:"William Castro",pos:["CM"],r:70},
  {n:"Pablo Bengoechea",pos:["CM","CAM"],r:73},{n:"Alfonso Domínguez",pos:["LW","CM"],r:71},
  {n:"Ruben Pereira",pos:["LW","CM"],r:70},{n:"Gabriel Correa",pos:["LW","ST"],r:70},
  {n:"Rubén Paz",pos:["CAM","CM"],r:76},{n:"Antonio Alzamendi",pos:["ST","LW"],r:73},
  {n:"Daniel Fonseca",pos:["ST","LW"],r:74},{n:"Rubén Sosa",pos:["LW","ST"],r:78},
  {n:"Enzo Francescoli",pos:["CAM","CM"],r:87}
 ]},
  {y:1970,p:[
  {n:"Ladislao Mazurkiewicz",pos:["GK"],r:82},{n:"Oscar Zubia",pos:["GK"],r:72},{n:"Francisco Cámera",pos:["GK"],r:70},
  {n:"Atilio Ancheta",pos:["CB","RB"],r:73},{n:"Roberto Matosas",pos:["CB"],r:74},
  {n:"Julio Montero Castillo",pos:["CB"],r:74},{n:"Luis Ubiña",pos:["CB","LB"],r:72},
  {n:"Walter Corbo",pos:["LB","CB"],r:70},{n:"Dagoberto Fontes",pos:["LB"],r:70},
  {n:"Héctor Santos",pos:["CDM","CM"],r:72},{n:"Julio Losada",pos:["CM","CDM"],r:72},
  {n:"Omar Caetano",pos:["CM","CDM"],r:71},{n:"Juan Mujica",pos:["CM"],r:70},
  {n:"Rodolfo Sandoval",pos:["CM","LW"],r:71},{n:"Alberto Gómez",pos:["LW","CM"],r:70},
  {n:"Julio César Cortés",pos:["LW","CM"],r:70},{n:"Ildo Maneiro",pos:["LW","RW"],r:70},
  {n:"Julio Morales",pos:["LW","ST"],r:74},{n:"Pedro Rocha",pos:["LW","ST"],r:77},
  {n:"Luis Cubilla",pos:["RW","LW"],r:76},{n:"Rúben Bareño",pos:["ST"],r:71},
  {n:"Víctor Espárrago",pos:["ST","LW"],r:74}
 ]},
  {y:1974,p:[
  {n:"Ladislao Mazurkiewicz",pos:["GK"],r:80},{n:"Baudilio Jáuregui",pos:["GK"],r:73},{n:"Alberto Cardaccio",pos:["GK"],r:70},
  {n:"Héctor Santos",pos:["RB","CB"],r:72},{n:"Julio Montero Castillo",pos:["CB"],r:74},
  {n:"Denis Milar",pos:["CB"],r:71},{n:"Gustavo de Simone",pos:["CB","LB"],r:71},
  {n:"Luis Garisto",pos:["LB","CB"],r:70},{n:"Juan Silva",pos:["LB"],r:70},
  {n:"José Gómez",pos:["CDM","CM"],r:71},{n:"Juan Carlos Masnik",pos:["CM","CDM"],r:72},
  {n:"Ricardo Pavoni",pos:["CM","CDM"],r:70},{n:"Rubén Corbo",pos:["CM"],r:70},
  {n:"Gustavo Fernández",pos:["CM","LW"],r:70},{n:"Walter Mantegazza",pos:["LW","CM"],r:70},
  {n:"Julio César Jiménez",pos:["LW","CM"],r:70},{n:"Luis Cubilla",pos:["RW","LW"],r:74},
  {n:"Pablo Forlán",pos:["LW","ST"],r:73},{n:"Mario González",pos:["ST"],r:70},
  {n:"Pedro Rocha",pos:["LW","ST"],r:75},{n:"Fernando Morena",pos:["ST"],r:76},
  {n:"Víctor Espárrago",pos:["ST","LW"],r:73}
 ]},
  {y:1966,p:[
  {n:"Ladislao Mazurkiewicz",pos:["GK"],r:80},{n:"Héctor Salvá",pos:["GK"],r:72},{n:"Roberto Sosa",pos:["GK"],r:70},
  {n:"Horacio Troche",pos:["RB","CB"],r:73},{n:"Héctor Silva",pos:["CB"],r:74},
  {n:"Luis Ubiña",pos:["CB"],r:72},{n:"Nelson Díaz",pos:["CB","LB"],r:71},
  {n:"Jorge Manicera",pos:["LB","CB"],r:70},{n:"Eliseo Álvarez",pos:["LB"],r:70},
  {n:"Néstor Gonçalves",pos:["CDM","CM"],r:76},{n:"Omar Caetano",pos:["CM","CDM"],r:71},
  {n:"Emilio Álvarez",pos:["CM","CDM"],r:70},{n:"Julio César Cortés",pos:["CM"],r:70},
  {n:"Walter Taibo",pos:["CM","LW"],r:70},{n:"Milton Viera",pos:["LW","CM"],r:71},
  {n:"Luis Ramos",pos:["LW","RW"],r:70},{n:"Domingo Pérez",pos:["LW","CAM"],r:71},
  {n:"José Urruzmendi",pos:["LW","ST"],r:70},{n:"José Sasía",pos:["ST","LW"],r:72},
  {n:"Pablo Forlán",pos:["ST","LW"],r:72},{n:"Pedro Rocha",pos:["LW","ST"],r:75},
  {n:"Víctor Espárrago",pos:["ST"],r:72}
 ]}
 ],
 "Croatia":[
  {y:2018,p:[{n:"Danijel Subasic",pos:["GK"],r:82},{n:"Lovre Kalinic",pos:["GK"],r:73},{n:"Dominik Livakovic",pos:["GK"],r:75},{n:"Sime Vrsaljko",pos:["RB","RWB"],r:79},{n:"Dejan Lovren",pos:["CB"],r:80},{n:"Domagoj Vida",pos:["CB"],r:79},{n:"Ivan Strinic",pos:["LB"],r:74},{n:"Vedran Corluka",pos:["CB","RB"],r:77},{n:"Duje Caleta-Car",pos:["CB"],r:74},{n:"Luka Modric",pos:["CM","CDM","CAM"],r:94},{n:"Ivan Rakitic",pos:["CM","CDM"],r:86},{n:"Marcelo Brozovic",pos:["CDM","CM"],r:85},{n:"Milan Badelj",pos:["CDM","CM"],r:75},{n:"Mateo Kovacic",pos:["CM","CAM"],r:82},{n:"Ivan Perisic",pos:["LW","LM","ST"],r:84},{n:"Ante Rebic",pos:["LW","ST"],r:81},{n:"Andrej Kramaric",pos:["ST","CAM"],r:81},{n:"Josip Brekalo",pos:["RW","LW"],r:75},{n:"Mario Mandzukic",pos:["ST","LW"],r:83},{n:"Nikola Kalinic",pos:["ST"],r:74},{n:"Tin Jedvaj",pos:["RB","CB"],r:72},{n:"Marko Pjaca",pos:["LW","CAM"],r:73},{n:"Filip Bradaric",pos:["CM"],r:71}]},
  {y:2022,p:[
  {n:"Dominik Livakovic",pos:["GK"],r:82},
  {n:"Ivo Grbic",pos:["GK"],r:74},
  {n:"Ivica Ivusic",pos:["GK"],r:73},
  {n:"Josip Juranovic",pos:["RB","RWB"],r:79},
  {n:"Josip Stanisic",pos:["RB","CB"],r:75},
  {n:"Dejan Lovren",pos:["CB"],r:79},
  {n:"Domagoj Vida",pos:["CB"],r:77},
  {n:"Josko Gvardiol",pos:["CB","LB"],r:84},
  {n:"Martin Erlic",pos:["CB"],r:74},
  {n:"Josip Sutalo",pos:["CB"],r:74},
  {n:"Borna Barisic",pos:["LB","LWB"],r:78},
  {n:"Borna Sosa",pos:["LB","LWB"],r:77},
  {n:"Luka Modric",pos:["CM","CDM","CAM"],r:92},
  {n:"Marcelo Brozovic",pos:["CDM","CM"],r:85},
  {n:"Mateo Kovacic",pos:["CM","CAM"],r:85},
  {n:"Mario Pasalic",pos:["CM","CAM"],r:79},
  {n:"Kristijan Jakic",pos:["CDM","CM"],r:75},
  {n:"Lovro Majer",pos:["CM","CAM"],r:77},
  {n:"Luka Sucic",pos:["CM","CAM"],r:74},
  {n:"Ivan Perisic",pos:["LW","LM","ST"],r:84},
  {n:"Andrej Kramaric",pos:["ST","CAM"],r:82},
  {n:"Nikola Vlasic",pos:["CAM","CM"],r:79},
  {n:"Marko Livaja",pos:["LW","ST"],r:75},
  {n:"Mislav Orsic",pos:["LW","ST"],r:78},
  {n:"Bruno Petkovic",pos:["ST"],r:76},
  {n:"Ante Budimir",pos:["ST"],r:74}
 ]},
  {y:2026,p:[
  {n:"Dominik Livakovic",pos:["GK"],r:84},{n:"Ivo Grbic",pos:["GK"],r:75},{n:"Ivor Pandur",pos:["GK"],r:72},
  {n:"Josip Stanisic",pos:["RB","CB"],r:77},{n:"Duje Caleta-Car",pos:["CB"],r:76},
  {n:"Josko Gvardiol",pos:["CB","LB"],r:87},{n:"Josip Sutalo",pos:["CB"],r:76},
  {n:"Martin Erlic",pos:["CB"],r:75},{n:"Marin Pongracic",pos:["CB"],r:75},
  {n:"Luka Vuskovic",pos:["CB"],r:73},{n:"Dominik Kotarski",pos:["GK"],r:73},
  {n:"Luka Modric",pos:["CM","CDM","CAM"],r:90},{n:"Mateo Kovacic",pos:["CM","CAM"],r:86},
  {n:"Kristijan Jakic",pos:["CDM","CM"],r:77},{n:"Luka Sucic",pos:["CM","CAM"],r:77},
  {n:"Mario Pasalic",pos:["CM","CAM"],r:80},{n:"Nikola Moro",pos:["CM","CDM"],r:75},
  {n:"Martin Baturina",pos:["CAM","CM"],r:78},{n:"Nikola Vlasic",pos:["CAM","CM"],r:80},
  {n:"Ivan Perisic",pos:["LW","LM","ST"],r:82},{n:"Andrej Kramaric",pos:["ST","CAM"],r:82},
  {n:"Petar Sučic",pos:["CM","LW"],r:74},{n:"Marco Pasalic",pos:["LW","RW"],r:73},
  {n:"Toni Fruk",pos:["LW","ST"],r:72},{n:"Igor Matanovic",pos:["ST"],r:75},
  {n:"Petar Musa",pos:["ST"],r:78},{n:"Ante Budimir",pos:["ST"],r:75}
 ]},
  {y:2006,p:[
  {n:"Stipe Pletikosa",pos:["GK"],r:80},{n:"Tomislav Butina",pos:["GK"],r:73},{n:"Joey Didulica",pos:["GK"],r:71},
  {n:"Darijo Srna",pos:["RB","RWB","CM"],r:82},{n:"Josip Šimunić",pos:["CB"],r:79},
  {n:"Dario Šimić",pos:["CB","RB"],r:79},{n:"Igor Tudor",pos:["CB","CDM"],r:77},
  {n:"Jurica Vranješ",pos:["LB","CB"],r:74},{n:"Anthony Šerić",pos:["CM","RB"],r:72},
  {n:"Mario Tokić",pos:["LB"],r:70},{n:"Niko Kovač",pos:["CDM","CM"],r:78},
  {n:"Robert Kovač",pos:["CDM","CB"],r:77},{n:"Stjepan Tomas",pos:["CM","CDM"],r:74},
  {n:"Marko Babić",pos:["CM","CDM"],r:73},{n:"Ivan Leko",pos:["CM","CAM"],r:74},
  {n:"Jerko Leko",pos:["CM","LW"],r:73},{n:"Niko Kranjčar",pos:["CAM","CM","LW"],r:79},
  {n:"Luka Modrić",pos:["CM","CAM"],r:78},{n:"Ivan Bošnjak",pos:["LW","ST"],r:70},
  {n:"Boško Balaban",pos:["ST"],r:72},{n:"Ivan Klasnić",pos:["ST","LW"],r:76},
  {n:"Dado Pršo",pos:["ST","LW"],r:77},{n:"Ivica Olić",pos:["ST","LW"],r:78}
 ]},
  {y:2014,p:[
  {n:"Danijel Subašić",pos:["GK"],r:81},{n:"Stipe Pletikosa",pos:["GK"],r:76},{n:"Oliver Zelenika",pos:["GK"],r:71},
  {n:"Šime Vrsaljko",pos:["RB","RWB"],r:78},{n:"Vedran Ćorluka",pos:["CB","RB"],r:79},
  {n:"Gordon Schildenfeld",pos:["CB"],r:73},{n:"Danijel Pranjić",pos:["LB","CM"],r:74},
  {n:"Dejan Lovren",pos:["CB"],r:78},{n:"Domagoj Vida",pos:["CB"],r:75},
  {n:"Sammir",pos:["CM","CAM"],r:71},{n:"Ognjen Vukojević",pos:["CDM","CM"],r:72},
  {n:"Marcelo Brozović",pos:["CDM","CM"],r:79},{n:"Ivan Rakitić",pos:["CM","CAM"],r:86},
  {n:"Milan Badelj",pos:["CDM","CM"],r:75},{n:"Luka Modrić",pos:["CM","CAM"],r:90},
  {n:"Eduardo",pos:["ST","LW"],r:71},{n:"Nikica Jelavić",pos:["ST"],r:76},
  {n:"Ivica Olić",pos:["ST","LW"],r:74},{n:"Ante Rebić",pos:["LW","ST"],r:73},
  {n:"Ivan Perišič",pos:["LW","LM","ST"],r:80},{n:"Mateo Kovačić",pos:["CM","CAM"],r:80},
  {n:"Mario Mandžukić",pos:["ST","LW"],r:83},{n:"Darijo Srna",pos:["RB","RWB"],r:79}
 ]},
  {y:1998,p:[
  {n:"Dražen Ladić",pos:["GK"],r:77},{n:"Vladimir Vasilj",pos:["GK"],r:72},{n:"Goran Jurić",pos:["GK"],r:70},
  {n:"Dario Šimić",pos:["CB","RB"],r:78},{n:"Igor Štimac",pos:["CB"],r:79},
  {n:"Slaven Bilić",pos:["CB"],r:82},{n:"Igor Tudor",pos:["CB","CDM"],r:76},
  {n:"Robert Jarni",pos:["LB","LWB"],r:79},{n:"Anthony Šerić",pos:["CM","RB"],r:72},
  {n:"Zvonimir Soldo",pos:["CDM","CM"],r:78},{n:"Aljoša Asanović",pos:["CM","CAM"],r:79},
  {n:"Robert Prosinečki",pos:["CAM","CM"],r:82},{n:"Zvonimir Boban",pos:["CM","CDM"],r:86},
  {n:"Ardian Kozniku",pos:["CM"],r:69},{n:"Zoran Mamić",pos:["CM","CDM"],r:72},
  {n:"Mario Stanić",pos:["CM","RW"],r:78},{n:"Marjan Mrmić",pos:["CM","LW"],r:69},
  {n:"Silvio Marić",pos:["LW","RW"],r:72},{n:"Krunoslav Jurčić",pos:["LW","ST"],r:71},
  {n:"Goran Vlaović",pos:["ST","LW"],r:75},{n:"Petar Krpan",pos:["ST"],r:70},
  {n:"Davor Šuker",pos:["ST"],r:88}
 ]},
  {y:2002,p:[
  {n:"Stipe Pletikosa",pos:["GK"],r:77},{n:"Tomislav Butina",pos:["GK"],r:72},{n:"Vladimir Vasilj",pos:["GK"],r:70},
  {n:"Boris Živković",pos:["RB","CB"],r:73},{n:"Robert Kovač",pos:["CB","CDM"],r:76},
  {n:"Dario Šimić",pos:["CB","RB"],r:77},{n:"Josip Šimunić",pos:["CB"],r:76},
  {n:"Robert Jarni",pos:["LB","LWB"],r:77},{n:"Jurica Vranješ",pos:["LB","CB"],r:72},
  {n:"Stjepan Tomas",pos:["CDM","CM"],r:73},{n:"Zvonimir Soldo",pos:["CDM","CM"],r:76},
  {n:"Niko Kovač",pos:["CM","CDM"],r:77},{n:"Anthony Šerić",pos:["CM","RB"],r:71},
  {n:"Mario Stanić",pos:["CM","RW"],r:76},{n:"Milan Rapaić",pos:["CM","CAM"],r:74},
  {n:"Robert Prosinečki",pos:["CAM","CM"],r:79},{n:"Daniel Šarić",pos:["CM","LW"],r:70},
  {n:"Goran Vlaović",pos:["LW","ST"],r:73},{n:"Alen Bokšić",pos:["ST","LW"],r:80},
  {n:"Davor Vugrinec",pos:["ST"],r:72},{n:"Boško Balaban",pos:["ST"],r:72},
  {n:"Ivica Olić",pos:["ST","LW"],r:74},{n:"Davor Šuker",pos:["ST"],r:84}
 ]}
 ],
 "Nigeria":[,
  {y:2018,p:[
  {n:"Francis Uzoho",pos:["GK"],r:73},
  {n:"Daniel Akpeyi",pos:["GK"],r:74},
  {n:"Ikechukwu Ezenwa",pos:["GK"],r:70},
  {n:"Tyronne Ebuehi",pos:["RB","RWB"],r:72},
  {n:"William Troost-Ekong",pos:["CB"],r:78},
  {n:"Leon Balogun",pos:["CB"],r:77},
  {n:"Kenneth Omeruo",pos:["CB"],r:76},
  {n:"Chidozie Awaziem",pos:["CB","RB"],r:73},
  {n:"Brian Idowu",pos:["LB","LWB"],r:72},
  {n:"Elderson Echiéjile",pos:["LB","LWB"],r:71},
  {n:"Shehu Abdullahi",pos:["RB","CM"],r:71},
  {n:"John Obi Mikel",pos:["CDM","CM"],r:80},
  {n:"Ogenyi Onazi",pos:["CM","CDM"],r:74},
  {n:"Wilfred Ndidi",pos:["CDM","CM"],r:82},
  {n:"Joel Obi",pos:["CM"],r:72},
  {n:"Peter Etebo",pos:["CM","CDM"],r:73},
  {n:"John Ogu",pos:["CM","CDM"],r:70},
  {n:"Alex Iwobi",pos:["CAM","LW","RW"],r:76},
  {n:"Victor Moses",pos:["RWB","RW","LW"],r:78},
  {n:"Ahmed Musa",pos:["LW","ST"],r:77},
  {n:"Kelechi Iheanacho",pos:["ST","CAM"],r:76},
  {n:"Odion Ighalo",pos:["ST"],r:77},
  {n:"Simeon Nwankwo",pos:["ST"],r:71}
 ]},
  {y:2010,p:[
  {n:"Vincent Enyeama",pos:["GK"],r:79},{n:"Dele Aiyenugba",pos:["GK"],r:71},{n:"Austin Ejide",pos:["GK"],r:72},
  {n:"Chidi Odiah",pos:["RB","CB"],r:73},{n:"Joseph Yobo",pos:["CB"],r:80},
  {n:"Danny Shittu",pos:["CB"],r:74},{n:"Rabiu Afolabi",pos:["LB","CB"],r:72},
  {n:"Taye Taiwo",pos:["LB","LWB"],r:76},{n:"Dele Adeleye",pos:["LB"],r:70},
  {n:"Ayila Yussuf",pos:["CDM","CM"],r:73},{n:"Lukman Haruna",pos:["CM","CDM"],r:72},
  {n:"Dickson Etuhu",pos:["CM","CDM"],r:74},{n:"John Utaka",pos:["RW","LW"],r:73},
  {n:"Sani Kaita",pos:["CM","CDM"],r:72},{n:"Victor Obinna",pos:["LW","CM"],r:73},
  {n:"Kalu Uche",pos:["LW","RW"],r:72},{n:"Chinedu Obasi",pos:["RW","LW"],r:74},
  {n:"Nwankwo Kanu",pos:["ST","CAM"],r:74},{n:"Yakubu",pos:["ST"],r:79},
  {n:"Obafemi Martins",pos:["ST","LW"],r:77},{n:"Peter Odemwingie",pos:["ST","LW"],r:77},
  {n:"Brown Ideye",pos:["ST"],r:73}
 ]},
  {y:2014,p:[
  {n:"Vincent Enyeama",pos:["GK"],r:80},{n:"Austin Ejide",pos:["GK"],r:72},{n:"Chigozie Agbim",pos:["GK"],r:70},
  {n:"Juwon Oshaniwa",pos:["LB","LWB"],r:72},{n:"Joseph Yobo",pos:["CB"],r:76},
  {n:"Godfrey Oboabona",pos:["CB"],r:73},{n:"Azubuike Egwuekwe",pos:["CB"],r:72},
  {n:"Efe Ambrose",pos:["CB","RB"],r:74},{n:"Kenneth Omeruo",pos:["CB"],r:74},
  {n:"Reuben Gabriel",pos:["LB","CB"],r:70},{n:"John Obi Mikel",pos:["CDM","CM"],r:80},
  {n:"Ogenyi Onazi",pos:["CM","CDM"],r:74},{n:"Ramon Azeez",pos:["CM","CDM"],r:71},
  {n:"Michael Babatunde",pos:["CM","LW"],r:71},{n:"Kunle Odunlami",pos:["CM"],r:69},
  {n:"Peter Odemwingie",pos:["ST","LW"],r:75},{n:"Uche Nwofor",pos:["ST","LW"],r:70},
  {n:"Shola Ameobi",pos:["ST"],r:71},{n:"Michael Uchebo",pos:["ST"],r:70},
  {n:"Ejike Uzoenyi",pos:["LW","CM"],r:72},{n:"Emmanuel Emenike",pos:["ST","LW"],r:76},
  {n:"Victor Moses",pos:["RWB","RW","LW"],r:77},{n:"Ahmed Musa",pos:["LW","ST"],r:76}
 ]},
  {y:1994,p:[
  {n:"Peter Rufai",pos:["GK"],r:78},{n:"Wilfred Agbonavbare",pos:["GK"],r:72},{n:"Alloysius Agu",pos:["GK"],r:70},
  {n:"Augustine Eguavoen",pos:["RB","CB"],r:74},{n:"Stephen Keshi",pos:["CB"],r:78},
  {n:"Uche Okechukwu",pos:["CB"],r:75},{n:"Uche Okafor",pos:["CB"],r:73},
  {n:"Benedict Iroha",pos:["LB","CB"],r:72},{n:"Michael Emenalo",pos:["RB","CM"],r:72},
  {n:"Thompson Oliha",pos:["CDM","CM"],r:72},{n:"Mutiu Adepoju",pos:["CDM","CM"],r:74},
  {n:"Sunday Oliseh",pos:["CM","CDM"],r:78},{n:"Emeka Ezeugo",pos:["CM","CDM"],r:70},
  {n:"Samson Siasia",pos:["CM","CAM"],r:74},{n:"Chidi Nwanu",pos:["CM"],r:70},
  {n:"Jay-Jay Okocha",pos:["CAM","CM"],r:84},{n:"Finidi George",pos:["RW","LW"],r:80},
  {n:"Victor Ikpeba",pos:["LW","RW"],r:78},{n:"Emmanuel Amunike",pos:["LW","ST"],r:76},
  {n:"Efan Ekoku",pos:["ST"],r:73},{n:"Daniel Amokachi",pos:["ST","LW"],r:77},
  {n:"Rashidi Yekini",pos:["ST"],r:82}
 ]},
  {y:1998,p:[
  {n:"Peter Rufai",pos:["GK"],r:76},{n:"Godwin Okpara",pos:["GK"],r:72},{n:"Abiodun Baruwa",pos:["GK"],r:70},
  {n:"Augustine Eguavoen",pos:["RB","CB"],r:73},{n:"Uche Okechukwu",pos:["CB"],r:74},
  {n:"Taribo West",pos:["CB"],r:79},{n:"Benedict Iroha",pos:["CB"],r:71},
  {n:"Celestine Babayaro",pos:["LB","LWB"],r:77},{n:"Mobi Oparaku",pos:["LB","CB"],r:70},
  {n:"Sunday Oliseh",pos:["CDM","CM"],r:79},{n:"Garba Lawal",pos:["CM","CDM"],r:74},
  {n:"Mutiu Adepoju",pos:["CM","CDM"],r:73},{n:"Willy Okpara",pos:["CM"],r:70},
  {n:"Wilson Oruma",pos:["CM","CAM"],r:73},{n:"Uche Okafor",pos:["CB"],r:72},
  {n:"Victor Ikpeba",pos:["LW","RW"],r:76},{n:"Tijani Babangida",pos:["RW","LW"],r:75},
  {n:"Finidi George",pos:["RW","LW"],r:78},{n:"Jay-Jay Okocha",pos:["CAM","CM"],r:86},
  {n:"Daniel Amokachi",pos:["ST","LW"],r:74},{n:"Nwankwo Kanu",pos:["ST","CAM"],r:81},
  {n:"Rashidi Yekini",pos:["ST"],r:79}
 ]},
  {y:2002,p:[
  {n:"Ike Shorunmu",pos:["GK"],r:74},{n:"Vincent Enyeama",pos:["GK"],r:74},{n:"Austin Ejide",pos:["GK"],r:71},
  {n:"Isaac Okoronkwo",pos:["CB","RB"],r:74},{n:"Joseph Yobo",pos:["CB"],r:77},
  {n:"Efe Sodje",pos:["CB"],r:72},{n:"Ifeanyi Udeze",pos:["LB","CB"],r:73},
  {n:"Rabiu Afolabi",pos:["LB","CB"],r:71},{n:"Eric Ejiofor",pos:["RB","CB"],r:70},
  {n:"Garba Lawal",pos:["CM","CDM"],r:73},{n:"Mutiu Adepoju",pos:["CDM","CM"],r:72},
  {n:"James Obiorah",pos:["CM","CDM"],r:70},{n:"Justice Christopher",pos:["CM"],r:69},
  {n:"Pius Ikedia",pos:["CM","LW"],r:70},{n:"Bartholomew Ogbeche",pos:["LW","ST"],r:71},
  {n:"Femi Opabunmi",pos:["LW","RW"],r:72},{n:"John Utaka",pos:["LW","ST"],r:72},
  {n:"Julius Aghahowa",pos:["LW","ST"],r:73},{n:"Benedict Akwuegbu",pos:["ST"],r:71},
  {n:"Nwankwo Kanu",pos:["ST","CAM"],r:79},{n:"Taribo West",pos:["CB"],r:76},
  {n:"Celestine Babayaro",pos:["LB","LWB"],r:75},{n:"Jay-Jay Okocha",pos:["CAM","CM"],r:85}
 ]}
 ],
 "Senegal":[,
  {y:2018,p:[
  {n:"Khadim N'Diaye",pos:["GK"],r:77},
  {n:"Abdoulaye Diallo",pos:["GK"],r:74},
  {n:"Alfred Gomis",pos:["GK"],r:73},
  {n:"Moussa Wague",pos:["RB","RWB"],r:73},
  {n:"Lamine Gassama",pos:["RB","CB"],r:72},
  {n:"Kalidou Koulibaly",pos:["CB"],r:85},
  {n:"Salif Sane",pos:["CB"],r:74},
  {n:"Kara Mbodji",pos:["CB"],r:75},
  {n:"Adama Mbengue",pos:["LB","CB"],r:69},
  {n:"Youssouf Sabaly",pos:["RB","LB"],r:74},
  {n:"Alfred N'Diaye",pos:["CDM","CM"],r:75},
  {n:"Idrissa Gueye",pos:["CM","CDM"],r:82},
  {n:"Cheikhou Kouyate",pos:["CDM","CM"],r:79},
  {n:"Cheikh N'Doye",pos:["CDM","CM"],r:72},
  {n:"Badou Ndiaye",pos:["CM","CDM"],r:75},
  {n:"Nampalys Mendy",pos:["CDM","CM"],r:73},
  {n:"Sadio Mane",pos:["LW","ST","RW"],r:91},
  {n:"Ismaila Sarr",pos:["LW","RW"],r:78},
  {n:"Keita Balde",pos:["LW","ST"],r:77},
  {n:"M'Baye Niang",pos:["ST","LW"],r:76},
  {n:"Diafra Sakho",pos:["ST","LW"],r:75},
  {n:"Moussa Sow",pos:["ST"],r:74},
  {n:"Moussa Konate",pos:["ST"],r:74},
  {n:"Mame Biram Diouf",pos:["ST","RW"],r:73}
 ]},
  {y:2022,p:[
  {n:"Edouard Mendy",pos:["GK"],r:87},
  {n:"Alfred Gomis",pos:["GK"],r:74},
  {n:"Seny Dieng",pos:["GK"],r:73},
  {n:"Youssouf Sabaly",pos:["RB","RWB"],r:75},
  {n:"Pape Abou Cisse",pos:["CB"],r:76},
  {n:"Kalidou Koulibaly",pos:["CB"],r:86},
  {n:"Abdou Diallo",pos:["CB","LB"],r:78},
  {n:"Formose Mendy",pos:["LB","CB"],r:71},
  {n:"Fodé Ballo-Toure",pos:["LB","LWB"],r:73},
  {n:"Ismail Jakobs",pos:["LB","LWB"],r:72},
  {n:"Idrissa Gueye",pos:["CM","CDM"],r:82},
  {n:"Cheikhou Kouyate",pos:["CDM","CM"],r:78},
  {n:"Nampalys Mendy",pos:["CDM","CM"],r:73},
  {n:"Moussa N'Diaye",pos:["CM","CDM"],r:70},
  {n:"Mamadou Loum",pos:["CM","CDM"],r:72},
  {n:"Pathé Ciss",pos:["CDM","CM"],r:73},
  {n:"Pape Gueye",pos:["CM","CDM"],r:74},
  {n:"Pape Matar Sarr",pos:["CM","CAM"],r:76},
  {n:"Krepin Diatta",pos:["RW","LW"],r:76},
  {n:"Ismaila Sarr",pos:["LW","RW"],r:83},
  {n:"Iliman Ndiaye",pos:["LW","CAM"],r:75},
  {n:"Nicolas Jackson",pos:["ST","LW"],r:77},
  {n:"Boulaye Dia",pos:["ST","LW"],r:78},
  {n:"Bamba Dieng",pos:["ST","LW"],r:73},
  {n:"Famara Diedhiou",pos:["ST"],r:74},
  {n:"Sadio Mane",pos:["LW","ST","RW"],r:90}
 ]},
  {y:2026,p:[
  {n:"Edouard Mendy",pos:["GK"],r:85},{n:"Yehvann Diouf",pos:["GK"],r:74},{n:"Mory Diaw",pos:["GK"],r:72},
  {n:"Youssouf Sabaly",pos:["RB","RWB"],r:75},{n:"Mamadou Sarr",pos:["RB","CB"],r:72},
  {n:"Kalidou Koulibaly",pos:["CB"],r:84},{n:"Moussa Niakhate",pos:["CB"],r:77},
  {n:"Abdoulaye Seck",pos:["CB"],r:74},{n:"Pape Abou Cisse",pos:["CB"],r:75},
  {n:"Ismail Jakobs",pos:["LB","LWB"],r:74},{n:"Fodé Ballo-Toure",pos:["LB","LWB"],r:73},
  {n:"Idrissa Gueye",pos:["CM","CDM"],r:80},{n:"Pape Matar Sarr",pos:["CM","CAM"],r:80},
  {n:"Pape Gueye",pos:["CM","CDM"],r:76},{n:"Habib Diarra",pos:["CM","CDM"],r:75},
  {n:"Lamine Camara",pos:["CM","CDM"],r:76},{n:"Pathé Ciss",pos:["CDM","CM"],r:73},
  {n:"Bara Sapoko Ndiaye",pos:["CM","CDM"],r:70},{n:"Antoine Mendy",pos:["LW","CAM"],r:72},
  {n:"Ismaila Sarr",pos:["LW","RW"],r:83},{n:"Iliman Ndiaye",pos:["LW","CAM"],r:79},
  {n:"Nicolas Jackson",pos:["ST","LW"],r:82},{n:"Krepin Diatta",pos:["RW","LW"],r:77},
  {n:"Assane Diao",pos:["LW","RW"],r:76},{n:"Sadio Mane",pos:["LW","ST","RW"],r:87},
  {n:"Bamba Dieng",pos:["ST","LW"],r:74},{n:"El Hadji Malick Diouf",pos:["ST"],r:72}
 ]},
  {y:2002,p:[
  {n:"Tony Sylva",pos:["GK"],r:77},{n:"Pape Malick Diop",pos:["GK"],r:71},{n:"Omar Diallo",pos:["GK"],r:70},
  {n:"Habib Beye",pos:["RB","CB"],r:74},{n:"Lamine Diatta",pos:["CB"],r:74},
  {n:"Aliou Cissé",pos:["CB","CDM"],r:73},{n:"Omar Daf",pos:["CB","LB"],r:72},
  {n:"Ferdinand Coly",pos:["LB","LWB"],r:73},{n:"Kalidou Cissokho",pos:["LB","CB"],r:70},
  {n:"Amdy Faye",pos:["CDM","CM"],r:73},{n:"Salif Diao",pos:["CM","CDM"],r:74},
  {n:"Moussa N'Diaye",pos:["CM","CDM"],r:70},{n:"Papa Bouba Diop",pos:["CM","CDM"],r:75},
  {n:"Pape Sarr",pos:["CM"],r:70},{n:"Pape Thiaw",pos:["CM","CDM"],r:70},
  {n:"Makhtar N'Diaye",pos:["LW","ST"],r:72},{n:"Sylvain N'Diaye",pos:["CM","LW"],r:70},
  {n:"Alassane N'Dour",pos:["LW","CM"],r:70},{n:"Khalilou Fadiga",pos:["LW","CAM"],r:76},
  {n:"Souleymane Camara",pos:["ST","LW"],r:71},{n:"Amara Traoré",pos:["LW","ST"],r:70},
  {n:"Henri Camara",pos:["ST","LW"],r:76},{n:"El Hadji Diouf",pos:["ST","LW"],r:80}
 ]}
 ],
 "Cameroon":[,
  {y:2022,p:[
  {n:"Andre Onana",pos:["GK"],r:85},
  {n:"Devis Epassy",pos:["GK"],r:71},
  {n:"Simon Ngapandouetnbu",pos:["GK"],r:70},
  {n:"Collins Fai",pos:["RB","RWB"],r:74},
  {n:"Olivier Mbaizo",pos:["RB","CB"],r:72},
  {n:"Jean-Charles Castelletto",pos:["CB"],r:76},
  {n:"Nicolas Nkoulou",pos:["CB"],r:78},
  {n:"Christopher Wooh",pos:["CB"],r:75},
  {n:"Enzo Ebosse",pos:["CB","LB"],r:73},
  {n:"Nouhou Tolo",pos:["LB","LWB"],r:74},
  {n:"Andre-Frank Zambo Anguissa",pos:["CM","CDM"],r:83},
  {n:"Samuel Gouet",pos:["CDM","CM"],r:74},
  {n:"Gael Ondoua",pos:["CM","CDM"],r:73},
  {n:"Martin Hongla",pos:["CM","CDM"],r:74},
  {n:"Pierre Kunde",pos:["CDM","CM"],r:73},
  {n:"Olivier Ntcham",pos:["CM","CAM"],r:74},
  {n:"Moumi Ngamaleu",pos:["LW","CAM"],r:75},
  {n:"Christian Bassogog",pos:["RW","LW"],r:76},
  {n:"Karl Toko Ekambi",pos:["LW","ST"],r:79},
  {n:"Bryan Mbeumo",pos:["RW","ST"],r:78},
  {n:"Georges-Kevin Nkoudou",pos:["LW","ST"],r:73},
  {n:"Souaibou Marou",pos:["RW","LW"],r:70},
  {n:"Jean-Pierre Nsame",pos:["ST"],r:77},
  {n:"Vincent Aboubakar",pos:["ST","LW"],r:82},
  {n:"Eric Maxim Choupo-Moting",pos:["ST","LW"],r:80},
  {n:"Jerome Ngom Mbekeli",pos:["CDM"],r:69}
 ]},
  {y:2010,p:[
  {n:"Carlos Kameni",pos:["GK"],r:78},{n:"Guy N'dy Assembé",pos:["GK"],r:72},{n:"Souleymanou Hamidou",pos:["GK"],r:70},
  {n:"Gaëtan Bong",pos:["RB","LB"],r:72},{n:"Nicolas Nkoulou",pos:["CB"],r:77},
  {n:"Aurélien Chedjou",pos:["CB"],r:74},{n:"Sébastien Bassong",pos:["CB"],r:76},
  {n:"Benoît Assou-Ekotto",pos:["LB","LWB"],r:76},{n:"Rigobert Song",pos:["CB","RB"],r:74},
  {n:"Stéphane Mbia",pos:["CDM","CM"],r:77},{n:"Jean Makoun",pos:["CM","CDM"],r:76},
  {n:"Landry N'Guémo",pos:["CDM","CM"],r:74},{n:"Geremi",pos:["CM","RB"],r:75},
  {n:"Eyong Enoh",pos:["CM","CDM"],r:73},{n:"Georges Mandjeck",pos:["CM","CDM"],r:72},
  {n:"Joël Matip",pos:["CM","CDM"],r:73},{n:"Achille Emaná",pos:["CAM","CM"],r:75},
  {n:"Alex Song",pos:["CDM","CM"],r:80},{n:"Pierre Webó",pos:["LW","ST"],r:74},
  {n:"Mohammadou Idrissou",pos:["ST"],r:73},{n:"Vincent Aboubakar",pos:["ST","LW"],r:74},
  {n:"Eric Maxim Choupo-Moting",pos:["ST","LW"],r:77},{n:"Samuel Eto'o",pos:["ST"],r:90}
 ]},
  {y:2014,p:[
  {n:"Charles Itandje",pos:["GK"],r:73},{n:"Cédric Djeugoué",pos:["GK"],r:71},{n:"Sammy Ndjock",pos:["GK"],r:70},
  {n:"Allan Nyom",pos:["RB","RWB"],r:74},{n:"Nicolas Nkoulou",pos:["CB"],r:78},
  {n:"Aurélien Chedjou",pos:["CB"],r:76},{n:"Dany Nounkeu",pos:["CB"],r:72},
  {n:"Henri Bedimo",pos:["LB","LWB"],r:74},{n:"Benoît Assou-Ekotto",pos:["LB","LWB"],r:74},
  {n:"Stéphane Mbia",pos:["CDM","CM"],r:77},{n:"Jean Makoun",pos:["CM","CDM"],r:74},
  {n:"Eyong Enoh",pos:["CM","CDM"],r:72},{n:"Landry N'Guémo",pos:["CDM","CM"],r:73},
  {n:"Joël Matip",pos:["CM","CDM"],r:76},{n:"Alex Song",pos:["CDM","CM"],r:81},
  {n:"Fabrice Olinga",pos:["LW","RW"],r:71},{n:"Edgar Salli",pos:["LW","RW"],r:70},
  {n:"Benjamin Moukandjo",pos:["LW","ST"],r:73},{n:"Loïc Feudjou",pos:["CM","LW"],r:70},
  {n:"Pierre Webó",pos:["LW","ST"],r:72},{n:"Vincent Aboubakar",pos:["ST","LW"],r:77},
  {n:"Eric Maxim Choupo-Moting",pos:["ST","LW"],r:78},{n:"Samuel Eto'o",pos:["ST"],r:86}
 ]},
  {y:1994,p:[
  {n:"Jacques Songo'o",pos:["GK"],r:78},{n:"Joseph-Antoine Bell",pos:["GK"],r:74},{n:"Thomas N'Kono",pos:["GK"],r:72},
  {n:"Stephen Tataw",pos:["RB","CB"],r:73},{n:"Rigobert Song",pos:["CB","RB"],r:76},
  {n:"André Kana-Biyik",pos:["CB"],r:75},{n:"Raymond Kalla",pos:["CB","LB"],r:72},
  {n:"Victor N'Dip",pos:["LB","CB"],r:70},{n:"Thomas Libiih",pos:["LB"],r:70},
  {n:"Émile Mbouh",pos:["CDM","CM"],r:71},{n:"Hans Agbo",pos:["CM","CDM"],r:70},
  {n:"Georges Mouyémé",pos:["CM","CDM"],r:71},{n:"Louis-Paul M'Fédé",pos:["CM","LW"],r:71},
  {n:"Emmanuel Maboang",pos:["CM"],r:70},{n:"Paul Loga",pos:["CM","RW"],r:70},
  {n:"Samuel Ekemé",pos:["LW","CM"],r:71},{n:"Jean-Pierre Fiala",pos:["LW","RW"],r:70},
  {n:"Alphonse Tchami",pos:["LW","ST"],r:72},{n:"David Embé",pos:["ST","LW"],r:70},
  {n:"François Omam-Biyik",pos:["LW","ST"],r:76},{n:"Marc-Vivien Foé",pos:["CM","CDM"],r:77},
  {n:"Roger Milla",pos:["ST","LW"],r:75}
 ]},
  {y:1998,p:[
  {n:"Jacques Songo'o",pos:["GK"],r:77},{n:"Alioum Boukar",pos:["GK"],r:72},{n:"William Andem",pos:["GK"],r:70},
  {n:"Pierre Njanka",pos:["RB","RWB"],r:73},{n:"Rigobert Song",pos:["CB"],r:79},
  {n:"Raymond Kalla",pos:["CB"],r:72},{n:"Augustine Simo",pos:["CB","LB"],r:71},
  {n:"Pierre Womé",pos:["LB","LWB"],r:74},{n:"Patrice Abanda",pos:["LB","CB"],r:70},
  {n:"Salomon Olembé",pos:["CDM","CM"],r:73},{n:"Michel Pensée",pos:["CM","CDM"],r:71},
  {n:"Joseph N'Do",pos:["CM","CDM"],r:72},{n:"Marcel Mahouvé",pos:["CM"],r:70},
  {n:"Alphonse Tchami",pos:["LW","CM"],r:71},{n:"Didier Angibeaud",pos:["CM","CDM"],r:70},
  {n:"Lauren",pos:["RB","RWB"],r:76},{n:"Joseph Elanga",pos:["LW","ST"],r:70},
  {n:"François Omam-Biyik",pos:["LW","ST"],r:72},{n:"Joseph-Désiré Job",pos:["ST","LW"],r:74},
  {n:"Samuel Ipoua",pos:["ST"],r:71},{n:"Patrick M'Boma",pos:["ST","LW"],r:79},
  {n:"Samuel Eto'o",pos:["ST","LW"],r:72}
 ]},
  {y:2002,p:[
  {n:"Jacques Songo'o",pos:["GK"],r:75},{n:"Carlos Kameni",pos:["GK"],r:74},{n:"Alioum Boukar",pos:["GK"],r:70},
  {n:"Bill Tchato",pos:["RB","CB"],r:73},{n:"Rigobert Song",pos:["CB","RB"],r:79},
  {n:"Nicolas Alnoudji",pos:["CB"],r:71},{n:"Lucien Mettomo",pos:["CB","LB"],r:73},
  {n:"Pierre Njanka",pos:["LB","LWB"],r:72},{n:"Pierre Womé",pos:["LB","CB"],r:73},
  {n:"Eric Djemba-Djemba",pos:["CDM","CM"],r:74},{n:"Geremi",pos:["CM","RB"],r:79},
  {n:"Joseph N'Do",pos:["CM","CDM"],r:72},{n:"Daniel Kome",pos:["CM","CDM"],r:70},
  {n:"Pius Ndiefi",pos:["CM"],r:70},{n:"Patrick Suffo",pos:["CM","LW"],r:72},
  {n:"Lauren",pos:["RB","RWB"],r:78},{n:"Salomon Olembé",pos:["LW","CM"],r:73},
  {n:"Joël Epalle",pos:["LW","ST"],r:71},{n:"Joseph-Désiré Job",pos:["ST","LW"],r:74},
  {n:"Raymond Kalla",pos:["CB","CDM"],r:70},{n:"Patrick M'Boma",pos:["ST","LW"],r:78},
  {n:"Marc-Vivien Foé",pos:["CM","CDM"],r:79},{n:"Samuel Eto'o",pos:["ST","LW"],r:80}
 ]},
  {y:1982,p:[
  {n:"Thomas N'Kono",pos:["GK"],r:80},{n:"Joseph-Antoine Bell",pos:["GK"],r:76},{n:"Charles Toubé",pos:["GK"],r:70},
  {n:"Stephen Tataw",pos:["RB","CB"],r:72},{n:"Emmanuel Kundé",pos:["CB"],r:74},
  {n:"Joseph Kamga",pos:["CB"],r:71},{n:"Simon Tchobang",pos:["CB","LB"],r:70},
  {n:"René N'Djeya",pos:["LB","CB"],r:70},{n:"François N'Doumbé",pos:["LB"],r:70},
  {n:"Ibrahim Aoudou",pos:["CDM","CM"],r:70},{n:"Jean-Pierre Tokoto",pos:["CM","CDM"],r:72},
  {n:"Joseph Enanga",pos:["CM","CDM"],r:70},{n:"Edmond Enoka",pos:["CM"],r:70},
  {n:"Jacques N'Guea",pos:["CM","LW"],r:70},{n:"Théophile Abega",pos:["CM","CAM"],r:75},
  {n:"Michel Kaham",pos:["LW","CM"],r:71},{n:"Paul Bahoken",pos:["LW","ST"],r:71},
  {n:"Ernest Ebongué",pos:["LW","ST"],r:70},{n:"Ephrem M'Bom",pos:["LW","RW"],r:70},
  {n:"Oscar Eyobo",pos:["ST","LW"],r:71},{n:"Elie Onana",pos:["ST"],r:70},
  {n:"Roger Milla",pos:["ST","LW"],r:81},{n:"Grégoire M'Bida",pos:["ST"],r:71}
 ]},
  {y:1990,p:[
  {n:"Thomas N'Kono",pos:["GK"],r:79},{n:"Jacques Songo'o",pos:["GK"],r:77},{n:"Joseph-Antoine Bell",pos:["GK"],r:74},
  {n:"Stephen Tataw",pos:["RB","CB"],r:73},{n:"André Kana-Biyik",pos:["CB"],r:74},
  {n:"Victor N'Dip",pos:["CB"],r:71},{n:"Thomas Libiih",pos:["CB","LB"],r:71},
  {n:"Benjamin Massing",pos:["CB","LB"],r:72},{n:"Emmanuel Kundé",pos:["CDM","CM"],r:73},
  {n:"Émile Mbouh",pos:["CDM","CM"],r:71},{n:"Jean-Claude Pagal",pos:["CM","CDM"],r:71},
  {n:"Jules Onana",pos:["CM","CDM"],r:70},{n:"Bonaventure Djonkep",pos:["CM"],r:70},
  {n:"Alphonse Yombi",pos:["CM","LW"],r:70},{n:"Emmanuel Maboang",pos:["CM","LW"],r:70},
  {n:"Louis-Paul M'Fédé",pos:["LW","CM"],r:71},{n:"Bertin Ebwellé",pos:["LW","RW"],r:70},
  {n:"Cyrille Makanaky",pos:["LW","ST"],r:73},{n:"Eugène Ekéké",pos:["ST","LW"],r:73},
  {n:"Roger Feutmba",pos:["ST"],r:70},{n:"François Omam-Biyik",pos:["LW","ST"],r:76},
  {n:"Roger Milla",pos:["ST","LW"],r:80}
 ]}
 ],
 "South Korea":[
  ,
  {y:2018,p:[
  {n:"Hyeon-woo Jo",pos:["GK"],r:72},
  {n:"Seung-gyu Kim",pos:["GK"],r:74},
  {n:"Jin-hyeon Kim",pos:["GK"],r:73},
  {n:"Yo-han Go",pos:["RB","CB"],r:71},
  {n:"Min-woo Kim",pos:["RB"],r:72},
  {n:"Young-gwon Kim",pos:["CB"],r:76},
  {n:"Hyun-soo Jang",pos:["CB"],r:75},
  {n:"Seung-hyun Jung",pos:["CB"],r:72},
  {n:"Joo-ho Park",pos:["LB","CB"],r:73},
  {n:"Yong Lee",pos:["LB","CM"],r:72},
  {n:"Ban-suk Oh",pos:["LB"],r:71},
  {n:"Sung-yueng Ki",pos:["CDM","CM"],r:79},
  {n:"Woo-young Jung",pos:["CM","CDM"],r:76},
  {n:"Se-jong Ju",pos:["CM","CDM"],r:73},
  {n:"Ja-cheol Koo",pos:["CM","CAM"],r:78},
  {n:"Jae-sung Lee",pos:["CM","LW"],r:77},
  {n:"Seon-min Moon",pos:["LW","CAM"],r:72},
  {n:"Seung-woo Lee",pos:["RW","LW"],r:72},
  {n:"Chul Hong",pos:["CM","RW"],r:71},
  {n:"Heung-min Son",pos:["LW","ST","RW"],r:87},
  {n:"Shin-wook Kim",pos:["ST"],r:75},
  {n:"Young-sun Yun",pos:["ST","LW"],r:70},
  {n:"Hee-chan Hwang",pos:["ST","LW"],r:75}
 ]},
  {y:2022,p:[
  {n:"Seung-gyu Kim",pos:["GK"],r:75},
  {n:"Hyeon-woo Jo",pos:["GK"],r:73},
  {n:"Song Bum-keun",pos:["GK"],r:72},
  {n:"Kim Moon-hwan",pos:["RB","RWB"],r:74},
  {n:"Kim Tae-hwan",pos:["RB","CB"],r:73},
  {n:"Kim Min-jae",pos:["CB"],r:86},
  {n:"Young-gwon Kim",pos:["CB"],r:76},
  {n:"Kwon Kyung-won",pos:["CB"],r:75},
  {n:"Chul Hong",pos:["CB","LB"],r:72},
  {n:"Kim Jin-su",pos:["LB","LWB"],r:74},
  {n:"Cho Yu-min",pos:["LB","LWB"],r:73},
  {n:"Woo-young Jung",pos:["CDM","CM"],r:77},
  {n:"Hwang In-beom",pos:["CM","CDM"],r:78},
  {n:"Paik Seung-ho",pos:["CM","CDM"],r:74},
  {n:"Son Jun-ho",pos:["CM","LW"],r:76},
  {n:"Lee Kang-in",pos:["CAM","CM","RW"],r:79},
  {n:"Jae-sung Lee",pos:["CM","LW"],r:77},
  {n:"Jeong Woo-yeong",pos:["CM","LW"],r:74},
  {n:"Kwon Chang-hoon",pos:["LW","CAM"],r:74},
  {n:"Na Sang-ho",pos:["LW","RW"],r:72},
  {n:"Heung-min Son",pos:["LW","ST","RW"],r:89},
  {n:"Hwang Ui-jo",pos:["ST","LW"],r:78},
  {n:"Hee-chan Hwang",pos:["ST","LW"],r:80},
  {n:"Cho Gue-sung",pos:["ST"],r:75},
  {n:"Yoon Jong-gyu",pos:["ST","LW"],r:70},
  {n:"Song Min-kyu",pos:["RW","LW"],r:72}
 ]},
  {y:2026,p:[
  {n:"Kim Seung-gyu",pos:["GK"],r:76},{n:"Jo Hyeon-woo",pos:["GK"],r:74},{n:"Jens Castrop",pos:["GK"],r:72},
  {n:"Kim Moon-hwan",pos:["RB","RWB"],r:75},{n:"Bae Jun-ho",pos:["RB","RWB"],r:73},
  {n:"Kim Min-jae",pos:["CB"],r:88},{n:"Kim Jin-gyu",pos:["CB"],r:76},
  {n:"Lee Tae-seok",pos:["CB"],r:73},{n:"Kim Tae-hyeon",pos:["CB","LB"],r:72},
  {n:"Cho Wi-je",pos:["LB","LWB"],r:75},{n:"Park Jin-seob",pos:["LB"],r:72},
  {n:"Hwang In-beom",pos:["CM","CDM"],r:80},{n:"Paik Seung-ho",pos:["CM","CDM"],r:76},
  {n:"Lee Dong-gyeong",pos:["CM","CDM"],r:75},{n:"Lee Kang-in",pos:["CAM","CM","RW"],r:82},
  {n:"Lee Gi-hyuk",pos:["CM","LW"],r:74},{n:"Song Bum-keun",pos:["CM","CDM"],r:73},
  {n:"Eom Ji-sung",pos:["CM","CAM"],r:73},{n:"Yang Hyun-jun",pos:["LW","RW"],r:76},
  {n:"Seol Young-woo",pos:["RW","LW"],r:73},{n:"Lee Jae-sung",pos:["CM","LW"],r:77},
  {n:"Hwang Hee-chan",pos:["LW","ST"],r:81},{n:"Oh Hyeon-gyu",pos:["ST"],r:77},
  {n:"Cho Gue-sung",pos:["ST"],r:77},{n:"Lee Han-beom",pos:["LW","RW"],r:72},
  {n:"Son Heung-min",pos:["LW","ST","RW"],r:90}
 ]},
  {y:2006,p:[
  {n:"Woon-jae Lee",pos:["GK"],r:77},{n:"Young-kwang Kim",pos:["GK"],r:74},{n:"Jin-kyu Kim",pos:["GK"],r:71},
  {n:"Young-chul Kim",pos:["RB","CB"],r:73},{n:"Jin-cheul Choi",pos:["CB"],r:77},
  {n:"Dong-jin Kim",pos:["CB"],r:74},{n:"Ji-hoon Baek",pos:["CB"],r:72},
  {n:"Young-pyo Lee",pos:["LB","LWB"],r:77},{n:"Chong-gug Song",pos:["RB","CM"],r:74},
  {n:"Sung-yueng Ki",pos:["CDM","CM"],r:73},{n:"Nam-il Kim",pos:["CDM","CM"],r:75},
  {n:"Sang-sik Kim",pos:["CM","CDM"],r:72},{n:"Eul-yong Lee",pos:["CM","LW"],r:73},
  {n:"Ki-hyeon Seol",pos:["CM","LW"],r:74},{n:"Ji-sung Park",pos:["CM","LW"],r:82},
  {n:"Kyung-ho Chung",pos:["CM"],r:70},{n:"Do-heon Kim",pos:["CM","CDM"],r:72},
  {n:"Chun-soo Lee",pos:["LW","CAM"],r:73},{n:"Seon-min Moon",pos:["LW","RW"],r:70},
  {n:"Jae-jin Cho",pos:["ST","LW"],r:71},{n:"Jung-hwan Ahn",pos:["ST"],r:74},
  {n:"Chu-young Park",pos:["ST"],r:77},{n:"Won-hee Cho",pos:["CAM"],r:70},
  {n:"Ho Lee",pos:["LB"],r:70}
 ]},
  {y:2010,p:[
  {n:"Woon-jae Lee",pos:["GK"],r:75},{n:"Young-kwang Kim",pos:["GK"],r:75},{n:"Sung-ryong Jung",pos:["GK"],r:74},
  {n:"Du-ri Cha",pos:["RB","RWB"],r:74},{n:"Jung-soo Lee",pos:["CB"],r:78},
  {n:"Hyung-il Kim",pos:["CB"],r:73},{n:"Young-pyo Lee",pos:["LB","LWB"],r:74},
  {n:"Beom-seok Oh",pos:["LB","CB"],r:72},{n:"Nam-il Kim",pos:["CDM","CM"],r:73},
  {n:"Seung-yeoul Lee",pos:["CDM","CM"],r:70},{n:"Yong-hyung Cho",pos:["CB","CDM"],r:71},
  {n:"Min-soo Kang",pos:["CM","CDM"],r:71},{n:"Sung-yueng Ki",pos:["CM","CAM"],r:77},
  {n:"Ji-sung Park",pos:["CM","LW"],r:81},{n:"Jung-hwan Ahn",pos:["CM","CAM"],r:71},
  {n:"Chung-yong Lee",pos:["LW","CM"],r:77},{n:"Jae-sung Kim",pos:["CM","LW"],r:74},
  {n:"Ki-hun Yeom",pos:["LW","RW"],r:72},{n:"Jung-woo Kim",pos:["CM","CAM"],r:71},
  {n:"Bo-kyung Kim",pos:["CAM","CM"],r:72},{n:"Dong-gook Lee",pos:["ST"],r:73},
  {n:"Chu-young Park",pos:["ST"],r:76}
 ]},
  {y:2014,p:[
  {n:"Sung-ryong Jung",pos:["GK"],r:75},{n:"Seung-gyu Kim",pos:["GK"],r:73},{n:"Chang-soo Kim",pos:["GK"],r:70},
  {n:"Seok-ho Hwang",pos:["RB","CB"],r:71},{n:"Young-gwon Kim",pos:["CB"],r:74},
  {n:"Jeong-ho Hong",pos:["CB"],r:74},{n:"Tae-hwi Kwak",pos:["CB"],r:73},
  {n:"Joo-ho Park",pos:["LB","CB"],r:73},{n:"Jong-woo Park",pos:["CB","CDM"],r:70},
  {n:"Suk-young Yun",pos:["LB","LWB"],r:72},{n:"Sung-yueng Ki",pos:["CDM","CM"],r:78},
  {n:"Kook-young Han",pos:["CDM","CM"],r:71},{n:"Dae-sung Ha",pos:["CM","CDM"],r:70},
  {n:"Keun-ho Lee",pos:["CM","LW"],r:72},{n:"Bum-young Lee",pos:["LW","CM"],r:70},
  {n:"Bo-kyung Kim",pos:["CAM","CM"],r:72},{n:"Chung-yong Lee",pos:["LW","CM"],r:76},
  {n:"Ja-cheol Koo",pos:["CM","CAM"],r:77},{n:"Yong Lee",pos:["LB","CM"],r:72},
  {n:"Chu-young Park",pos:["ST"],r:74},{n:"Dong-won Ji",pos:["ST","LW"],r:72},
  {n:"Shin-wook Kim",pos:["ST"],r:73},{n:"Heung-min Son",pos:["LW","ST"],r:83}
 ]},
  {y:1994,p:[
  {n:"Woon-jae Lee",pos:["GK"],r:74},{n:"Sang-bum Gu",pos:["GK"],r:72},{n:"Jeong-woon Ko",pos:["GK"],r:70},
  {n:"Young-jin Lee",pos:["RB","CB"],r:72},{n:"Myung-bo Hong",pos:["CB","CDM"],r:79},
  {n:"Jung-bae Park",pos:["CB"],r:73},{n:"Chul-woo Park",pos:["CB","LB"],r:72},
  {n:"Jung-won Seo",pos:["LB","CB"],r:71},{n:"Seok-ju Ha",pos:["CDM","CM"],r:73},
  {n:"Jong-hwa Lee",pos:["CDM","CM"],r:71},{n:"Jong-son Chung",pos:["CM","CDM"],r:72},
  {n:"Ik-soo An",pos:["CM","CDM"],r:70},{n:"In-young Choi",pos:["CM"],r:70},
  {n:"Pan-keun Kim",pos:["CM","LW"],r:71},{n:"Moon-sik Choi",pos:["LW","CM"],r:70},
  {n:"Dae-shik Choi",pos:["LW","RW"],r:70},{n:"Hong-gi Shin",pos:["CM","CAM"],r:71},
  {n:"Young-il Choi",pos:["CM","LW"],r:70},{n:"Jung-yoon Noh",pos:["CAM","ST"],r:71},
  {n:"Jin-ho Cho",pos:["ST","LW"],r:71},{n:"Joo-sung Kim",pos:["ST"],r:72},
  {n:"Sun-hong Hwang",pos:["ST","LW"],r:76}
 ]},
  {y:1998,p:[
  {n:"Byung-ji Kim",pos:["GK"],r:77},{n:"Woon-jae Lee",pos:["GK"],r:75},{n:"Sang-yoon Lee",pos:["GK"],r:70},
  {n:"Myung-bo Hong",pos:["CB","CDM"],r:79},{n:"Jung-won Seo",pos:["CB"],r:73},
  {n:"Hyung-seok Jang",pos:["CB","LB"],r:72},{n:"Tae-young Kim",pos:["RB","CB"],r:73},
  {n:"Dae-il Jang",pos:["LB","CB"],r:71},{n:"Seok-ju Ha",pos:["CDM","CM"],r:72},
  {n:"Min-sung Lee",pos:["CDM","CM"],r:70},{n:"Dong-myung Seo",pos:["CM","CDM"],r:70},
  {n:"Jong-soo Ko",pos:["CM","CDM"],r:71},{n:"Young-il Choi",pos:["CM","LW"],r:70},
  {n:"Sang-chul Yoo",pos:["CM","LW"],r:74},{n:"Lim-saeng Lee",pos:["LW","CM"],r:70},
  {n:"Do-keun Kim",pos:["CM","CAM"],r:71},{n:"Jung-yoon Noh",pos:["CAM","CM"],r:71},
  {n:"Sang-hun Lee",pos:["LW","ST"],r:70},{n:"Yong-soo Choi",pos:["ST","LW"],r:72},
  {n:"Do-hoon Kim",pos:["ST"],r:72},{n:"Sun-hong Hwang",pos:["ST","LW"],r:77},
  {n:"Dong-gook Lee",pos:["ST"],r:76}
 ]},
  {y:2002,p:[
  {n:"Byung-ji Kim",pos:["GK"],r:77},{n:"Woon-jae Lee",pos:["GK"],r:76},{n:"Eun-sung Choi",pos:["GK"],r:70},
  {n:"Du-ri Cha",pos:["RB","RWB"],r:74},{n:"Myung-bo Hong",pos:["CB","CDM"],r:78},
  {n:"Jin-cheul Choi",pos:["CB"],r:74},{n:"Chong-gug Song",pos:["CB","CDM"],r:74},
  {n:"Young-pyo Lee",pos:["LB","LWB"],r:76},{n:"Tae-uk Choi",pos:["LB","CB"],r:72},
  {n:"Nam-il Kim",pos:["CDM","CM"],r:74},{n:"Sang-chul Yoo",pos:["CM","CDM"],r:74},
  {n:"Jong-hwan Yoon",pos:["CDM","CM"],r:71},{n:"Eul-yong Lee",pos:["CM","LW"],r:73},
  {n:"Sung-yong Choi",pos:["CM","LW"],r:71},{n:"Min-sung Lee",pos:["LB","CM"],r:70},
  {n:"Tae-young Kim",pos:["RB","CM"],r:72},{n:"Ki-hyeon Seol",pos:["LW","CM"],r:74},
  {n:"Young-min Hyun",pos:["CM","CAM"],r:70},{n:"Yong-soo Choi",pos:["ST","LW"],r:72},
  {n:"Chun-soo Lee",pos:["LW","CAM"],r:73},{n:"Sun-hong Hwang",pos:["ST","LW"],r:76},
  {n:"Jung-hwan Ahn",pos:["ST"],r:75},{n:"Ji-sung Park",pos:["CM","LW"],r:78}
 ]},
  {y:1986,p:[
  {n:"Byung-joo Byun",pos:["GK"],r:74},{n:"Kwang-rae Cho",pos:["GK"],r:72},{n:"Yun-kyo Oh",pos:["GK"],r:70},
  {n:"Chang-sun Park",pos:["RB","CB"],r:71},{n:"Kyung-hoon Park",pos:["CB"],r:72},
  {n:"Jong-soo Chung",pos:["CB"],r:72},{n:"Min-kook Cho",pos:["CB","LB"],r:71},
  {n:"Byung-ok Yoo",pos:["LB","CB"],r:70},{n:"Deuk-soo Kang",pos:["LB"],r:70},
  {n:"Sam-soo Kim",pos:["CDM","CM"],r:71},{n:"Jong-boo Kim",pos:["CM","CDM"],r:71},
  {n:"Pyung-seok Kim",pos:["CM","CDM"],r:71},{n:"Joo-sung Kim",pos:["CM"],r:73},
  {n:"Young-jeung Cho",pos:["CM","LW"],r:70},{n:"Soo-jin Noh",pos:["LW","CM"],r:71},
  {n:"Tae-ho Lee",pos:["LW","CM"],r:70},{n:"Jung-moo Huh",pos:["CM","CAM"],r:72},
  {n:"Byung-deuk Cho",pos:["LW","RW"],r:70},{n:"Soon-ho Choi",pos:["LW","ST"],r:72},
  {n:"Yong-hwan Chung",pos:["ST","LW"],r:70},{n:"Yong-se Kim",pos:["ST"],r:71},
  {n:"Bum-kun Cha",pos:["LW","ST"],r:79}
 ]},
  {y:1990,p:[
  {n:"Myung-bo Hong",pos:["CB","CDM"],r:77},{n:"Byung-joo Byun",pos:["GK"],r:73},{n:"Sang-bum Gu",pos:["GK"],r:72},
  {n:"Young-jin Lee",pos:["RB","CB"],r:71},{n:"Jong-soo Chung",pos:["CB"],r:72},
  {n:"Joo-sung Kim",pos:["CB","CDM"],r:73},{n:"Hae-won Chung",pos:["CB","LB"],r:71},
  {n:"Kwan Hwangbo",pos:["LB","CB"],r:70},{n:"Heung-sil Lee",pos:["LB"],r:70},
  {n:"Gi-dong Jeong",pos:["CDM","CM"],r:71},{n:"Soo-jin Noh",pos:["CM","CDM"],r:71},
  {n:"In-young Choi",pos:["CM","CDM"],r:70},{n:"Kang-hee Choi",pos:["CM"],r:70},
  {n:"Tae-ho Lee",pos:["CM","LW"],r:70},{n:"Yong-hwan Chung",pos:["CM","LW"],r:70},
  {n:"Deok-yeo Yoon",pos:["LW","CM"],r:70},{n:"Kyung-hoon Park",pos:["CM","RW"],r:71},
  {n:"Min-kook Cho",pos:["CB","CDM"],r:71},{n:"Sun-hong Hwang",pos:["LW","ST"],r:73},
  {n:"Poong-joo Kim",pos:["ST"],r:70},{n:"Soon-ho Choi",pos:["LW","ST"],r:72},
  {n:"Sang-yoon Lee",pos:["ST","LW"],r:70}
 ]}
 ],
 "Japan":[,
  {y:2018,p:[
  {n:"Eiji Kawashima",pos:["GK"],r:74},
  {n:"Masaaki Higashiguchi",pos:["GK"],r:75},
  {n:"Kosuke Nakamura",pos:["GK"],r:73},
  {n:"Hiroki Sakai",pos:["RB","RWB"],r:77},
  {n:"Gotoku Sakai",pos:["RB","CB"],r:74},
  {n:"Naomichi Ueda",pos:["CB"],r:73},
  {n:"Maya Yoshida",pos:["CB"],r:79},
  {n:"Tomoaki Makino",pos:["CB"],r:73},
  {n:"Yuto Nagatomo",pos:["LB","LWB"],r:78},
  {n:"Makoto Hasebe",pos:["CDM","CB","CM"],r:79},
  {n:"Hotaru Yamaguchi",pos:["CM","CDM"],r:75},
  {n:"Wataru Endo",pos:["CDM","CM"],r:74},
  {n:"Gaku Shibasaki",pos:["CM","CAM"],r:76},
  {n:"Ryota Oshima",pos:["CM","LW"],r:72},
  {n:"Shinji Kagawa",pos:["CAM","CM"],r:82},
  {n:"Keisuke Honda",pos:["CAM","RW","CM"],r:79},
  {n:"Genki Haraguchi",pos:["LW","CM"],r:76},
  {n:"Takashi Inui",pos:["LW","RW"],r:76},
  {n:"Takashi Usami",pos:["CAM","LW"],r:72},
  {n:"Shinji Okazaki",pos:["ST","LW"],r:78},
  {n:"Yoshinori Muto",pos:["ST","LW"],r:73},
  {n:"Yuya Osako",pos:["ST"],r:76},
  {n:"Yuta Nagatomo",pos:["LB"],r:77}
 ]},
  {y:2022,p:[
  {n:"Shuichi Gonda",pos:["GK"],r:75},
  {n:"Eiji Kawashima",pos:["GK"],r:73},
  {n:"Daniel Schmidt",pos:["GK"],r:74},
  {n:"Hiroki Sakai",pos:["RB","RWB"],r:77},
  {n:"Miki Yamane",pos:["RB","RWB"],r:74},
  {n:"Ko Itakura",pos:["CB","CDM"],r:78},
  {n:"Maya Yoshida",pos:["CB"],r:78},
  {n:"Shogo Taniguchi",pos:["CB"],r:75},
  {n:"Takehiro Tomiyasu",pos:["RB","CB"],r:81},
  {n:"Yuto Nagatomo",pos:["LB","LWB"],r:77},
  {n:"Hiroki Ito",pos:["LB","CB"],r:77},
  {n:"Wataru Endo",pos:["CDM","CM"],r:79},
  {n:"Gaku Shibasaki",pos:["CM","CAM"],r:74},
  {n:"Hidemasa Morita",pos:["CDM","CM"],r:75},
  {n:"Ao Tanaka",pos:["CM","CDM"],r:77},
  {n:"Ritsu Doan",pos:["LW","RW","CAM"],r:79},
  {n:"Junya Ito",pos:["RW","LW"],r:78},
  {n:"Daichi Kamada",pos:["CAM","CM"],r:80},
  {n:"Kaoru Mitoma",pos:["LW","ST"],r:82},
  {n:"Takefusa Kubo",pos:["RW","CAM","LW"],r:81},
  {n:"Takuma Asano",pos:["LW","ST"],r:75},
  {n:"Takumi Minamino",pos:["LW","ST","CAM"],r:79},
  {n:"Daizen Maeda",pos:["LW","ST"],r:75},
  {n:"Yuki Soma",pos:["LW","RW"],r:72},
  {n:"Ayase Ueda",pos:["ST"],r:77},
  {n:"Shuto Machino",pos:["ST"],r:71}
 ]},
  {y:2026,p:[
  {n:"Hayakawa Tomoki",pos:["GK"],r:78},{n:"Taniguchi Shogo",pos:["GK"],r:74},{n:"Suzuki Junnosuke",pos:["GK"],r:71},
  {n:"Sugawara Yukinari",pos:["RB","RWB"],r:80},{n:"Tomiyasu Takehiro",pos:["RB","CB"],r:83},
  {n:"Ko Itakura",pos:["CB","CDM"],r:80},{n:"Shiogai Kento",pos:["CB"],r:76},
  {n:"Sano Kaishu",pos:["CB","LB"],r:72},{n:"Watanabe Tsuyoshi",pos:["CB","LB"],r:72},
  {n:"To Hiroki",pos:["LB","LWB"],r:79},{n:"Nagatomo Yuto",pos:["LB","LWB"],r:75},
  {n:"Endo Wataru",pos:["CDM","CM"],r:82},{n:"Tanaka Ao",pos:["CM","CDM"],r:80},
  {n:"Hidemasa Morita",pos:["CDM","CM"],r:77},{n:"Takura Kou",pos:["CM"],r:72},
  {n:"Kamada Daichi",pos:["CAM","CM"],r:82},{n:"Suzuki Yuito",pos:["CM","LW"],r:73},
  {n:"Doan Ritsu",pos:["LW","RW","CAM"],r:81},{n:"To Junya",pos:["RW","LW"],r:79},
  {n:"Kubo Takefusa",pos:["RW","CAM","LW"],r:84},{n:"Maeda Daizen",pos:["LW","ST"],r:77},
  {n:"Nakamura Keito",pos:["LW","CAM"],r:76},{n:"Goto Keisuke",pos:["LW","RW"],r:73},
  {n:"Suzuki Zion",pos:["LW","ST"],r:73},{n:"Ueda Ayase",pos:["ST"],r:80},
  {n:"Ogawa Koki",pos:["ST"],r:76}
 ]},
  {y:2006,p:[
  {n:"Yoshikatsu Kawaguchi",pos:["GK"],r:77},{n:"Seigo Narazaki",pos:["GK"],r:76},{n:"Yoichi Doi",pos:["GK"],r:71},
  {n:"Akira Kaji",pos:["RB","RWB"],r:73},{n:"Tsuneyasu Miyamoto",pos:["CB"],r:76},
  {n:"Alessandro Santos",pos:["CB","RB"],r:74},{n:"Kōji Nakata",pos:["CB"],r:74},
  {n:"Yūichi Komano",pos:["RB","CB"],r:73},{n:"Keisuke Tsuboi",pos:["LB","CB"],r:71},
  {n:"Takashi Fukunishi",pos:["CDM","CM"],r:75},{n:"Teruyuki Moniwa",pos:["CM","CDM"],r:71},
  {n:"Mitsuo Ogasawara",pos:["CM","CAM"],r:76},{n:"Shunsuke Nakamura",pos:["CAM","CM"],r:82},
  {n:"Shinji Ono",pos:["CM","CAM"],r:75},{n:"Hidetoshi Nakata",pos:["CM","CAM"],r:83},
  {n:"Junichi Inamoto",pos:["CM","CDM"],r:74},{n:"Seiichiro Maki",pos:["LW","CM"],r:71},
  {n:"Keiji Tamada",pos:["LW","ST"],r:73},{n:"Masashi Oguro",pos:["LW","ST"],r:72},
  {n:"Yasuhito Endō",pos:["CM","CAM"],r:78},{n:"Atsushi Yanagisawa",pos:["ST"],r:72},
  {n:"Naohiro Takahara",pos:["ST"],r:74}
 ]},
  {y:2010,p:[
  {n:"Eiji Kawashima",pos:["GK"],r:76},{n:"Yoshikatsu Kawaguchi",pos:["GK"],r:74},{n:"Seigo Narazaki",pos:["GK"],r:73},
  {n:"Atsuto Uchida",pos:["RB","RWB"],r:77},{n:"Marcus Tulio Tanaka",pos:["CB"],r:74},
  {n:"Yuji Nakazawa",pos:["CB"],r:77},{n:"Yūichi Komano",pos:["RB","CB"],r:73},
  {n:"Yuto Nagatomo",pos:["LB","LWB"],r:79},{n:"Daiki Iwamasa",pos:["LB"],r:70},
  {n:"Makoto Hasebe",pos:["CDM","CM"],r:78},{n:"Yasuyuki Konno",pos:["CDM","CM"],r:73},
  {n:"Junichi Inamoto",pos:["CM","CDM"],r:72},{n:"Kengo Nakamura",pos:["CM","CAM"],r:74},
  {n:"Shunsuke Nakamura",pos:["CAM","CM"],r:79},{n:"Yasuhito Endō",pos:["CM","CAM"],r:78},
  {n:"Yuki Abe",pos:["CM","LW"],r:71},{n:"Daisuke Matsui",pos:["LW","CAM"],r:72},
  {n:"Keisuke Honda",pos:["CAM","CM","ST"],r:81},{n:"Yoshito Ōkubo",pos:["ST","LW"],r:74},
  {n:"Keiji Tamada",pos:["LW","ST"],r:71},{n:"Takayuki Morimoto",pos:["ST","LW"],r:71},
  {n:"Kisho Yano",pos:["ST"],r:70},{n:"Shinji Okazaki",pos:["ST","LW"],r:77}
 ]},
  {y:2014,p:[
  {n:"Eiji Kawashima",pos:["GK"],r:75},{n:"Shūichi Gonda",pos:["GK"],r:73},{n:"Shusaku Nishikawa",pos:["GK"],r:73},
  {n:"Atsuto Uchida",pos:["RB","RWB"],r:77},{n:"Hiroki Sakai",pos:["RB","RWB"],r:74},
  {n:"Gōtoku Sakai",pos:["RB","CB"],r:72},{n:"Maya Yoshida",pos:["CB"],r:77},
  {n:"Masahiko Inoha",pos:["CB"],r:72},{n:"Masato Morishige",pos:["CB"],r:73},
  {n:"Yuto Nagatomo",pos:["LB","LWB"],r:78},{n:"Makoto Hasebe",pos:["CDM","CM"],r:78},
  {n:"Yasuyuki Konno",pos:["CDM","CM"],r:72},{n:"Toshihiro Aoyama",pos:["CM","CDM"],r:71},
  {n:"Yasuhito Endō",pos:["CM","CAM"],r:77},{n:"Hotaru Yamaguchi",pos:["CM","CDM"],r:73},
  {n:"Hiroshi Kiyotake",pos:["LW","CAM"],r:74},{n:"Manabu Saitō",pos:["CM","LW"],r:71},
  {n:"Yoichiro Kakitani",pos:["LW","CAM"],r:73},{n:"Yoshito Ōkubo",pos:["ST","LW"],r:73},
  {n:"Yuya Osako",pos:["ST","LW"],r:74},{n:"Keisuke Honda",pos:["CAM","CM"],r:83},
  {n:"Shinji Kagawa",pos:["CAM","CM"],r:83},{n:"Shinji Okazaki",pos:["ST","LW"],r:78}
 ]},
  {y:1998,p:[
  {n:"Yoshikatsu Kawaguchi",pos:["GK"],r:77},{n:"Motohiro Yamaguchi",pos:["GK"],r:72},{n:"Seigo Narazaki",pos:["GK"],r:73},
  {n:"Yutaka Akita",pos:["RB","CB"],r:73},{n:"Masami Ihara",pos:["CB"],r:77},
  {n:"Naoki Soma",pos:["CB"],r:73},{n:"Akira Narahashi",pos:["LB","CB"],r:71},
  {n:"Eisuke Nakanishi",pos:["LB","RB"],r:70},{n:"Toshihide Saito",pos:["RB"],r:69},
  {n:"Takashi Hirano",pos:["CDM","CM"],r:71},{n:"Teruyoshi Ito",pos:["CM","CDM"],r:70},
  {n:"Masayuki Okano",pos:["CM","CDM"],r:72},{n:"Toshihiro Hattori",pos:["CM"],r:70},
  {n:"Wagner Lopes",pos:["CM","ST"],r:72},{n:"Nobuyuki Kojima",pos:["CM","LW"],r:70},
  {n:"Norio Omura",pos:["CM","RW"],r:70},{n:"Shinji Ono",pos:["CAM","CM"],r:76},
  {n:"Hiroaki Morishima",pos:["LW","CAM"],r:72},{n:"Hiroshi Nanami",pos:["CM","CAM"],r:74},
  {n:"Masashi Nakayama",pos:["ST"],r:73},{n:"Shoji Jo",pos:["ST","LW"],r:71},
  {n:"Hidetoshi Nakata",pos:["CAM","CM"],r:82}
 ]},
  {y:2002,p:[
  {n:"Yoshikatsu Kawaguchi",pos:["GK"],r:77},{n:"Seigo Narazaki",pos:["GK"],r:75},{n:"Hitoshi Sogahata",pos:["GK"],r:71},
  {n:"Yutaka Akita",pos:["RB","CB"],r:72},{n:"Tsuneyasu Miyamoto",pos:["CB"],r:77},
  {n:"Naoki Matsuda",pos:["CB"],r:74},{n:"Kōji Nakata",pos:["CB"],r:73},
  {n:"Alessandro Santos",pos:["RB","CB"],r:73},{n:"Daisuke Ichikawa",pos:["LB","LWB"],r:71},
  {n:"Makoto Hasebe",pos:["CDM","CM"],r:72},{n:"Junichi Inamoto",pos:["CM","CDM"],r:75},
  {n:"Kazuyuki Toda",pos:["CDM","CM"],r:72},{n:"Mitsuo Ogasawara",pos:["CM","CAM"],r:75},
  {n:"Takashi Fukunishi",pos:["CM","CDM"],r:74},{n:"Tomokazu Myojin",pos:["CM"],r:70},
  {n:"Toshihiro Hattori",pos:["CM","LW"],r:70},{n:"Hiroaki Morishima",pos:["LW","CAM"],r:72},
  {n:"Akinori Nishizawa",pos:["LW","ST"],r:72},{n:"Takayuki Suzuki",pos:["LW","ST"],r:73},
  {n:"Masashi Nakayama",pos:["ST"],r:73},{n:"Ryuzo Morioka",pos:["LW","ST"],r:70},
  {n:"Atsushi Yanagisawa",pos:["ST"],r:72},{n:"Hidetoshi Nakata",pos:["CAM","CM"],r:83}
 ]}
 ],
 "Turkey":[,
  {y:2026,p:[
  {n:"Mert Gunok",pos:["GK"],r:81},{n:"Altay Bayindir",pos:["GK"],r:79},{n:"Ugurcan Cakir",pos:["GK"],r:79},
  {n:"Zeki Celik",pos:["RB","RWB"],r:80},{n:"Mert Muldur",pos:["RB","CB"],r:77},
  {n:"Merih Demiral",pos:["CB"],r:83},{n:"Kaan Ayhan",pos:["CB"],r:79},
  {n:"Abdülkerim Bardakci",pos:["CB"],r:78},{n:"Ozan Kabak",pos:["CB"],r:77},
  {n:"Samet Akaydin",pos:["CB"],r:75},{n:"Çağlar Soyuncu",pos:["CB"],r:80},
  {n:"Ferdi Kadioglu",pos:["LB","LWB","CM"],r:82},{n:"Eren Elmali",pos:["LB","LWB"],r:74},
  {n:"Hakan Calhanoglu",pos:["CDM","CM","CAM"],r:87},{n:"Salih Ozcan",pos:["CDM","CM"],r:78},
  {n:"Orkun Kokcu",pos:["CM","CAM"],r:81},{n:"Ismail Yuksek",pos:["CM","CDM"],r:76},
  {n:"Irfan Can Kahveci",pos:["CM","LW"],r:77},{n:"Oğuz Aydin",pos:["CM"],r:72},
  {n:"Kerem Akturkoğlu",pos:["LW","RW"],r:82},{n:"Barış Alper Yilmaz",pos:["LW","RW"],r:80},
  {n:"Yunus Akgun",pos:["LW","CAM"],r:77},{n:"Can Uzun",pos:["LW","ST"],r:77},
  {n:"Deniz Gul",pos:["ST"],r:73},{n:"Kenan Yildiz",pos:["CAM","LW","RW"],r:83},
  {n:"Arda Guler",pos:["CAM","RW","LW"],r:87}
 ]},
  {y:2002,p:[
  {n:"Rüştü Reçber",pos:["GK"],r:82},{n:"Ömer Çatkıç",pos:["GK"],r:74},{n:"Fatih Akyel",pos:["GK"],r:70},
  {n:"Alpay Özalan",pos:["CB"],r:77},{n:"Bülent Korkmaz",pos:["CB"],r:78},
  {n:"Emre Aşık",pos:["CB"],r:73},{n:"Ümit Özat",pos:["CB","LB"],r:72},
  {n:"Zafer Özgültekin",pos:["RB","CB"],r:71},{n:"Ergün Penbe",pos:["LB","LWB"],r:72},
  {n:"Ümit Davala",pos:["LB","CM"],r:74},{n:"Tugay Kerimoğlu",pos:["CDM","CM"],r:80},
  {n:"Okan Buruk",pos:["CM","CDM"],r:74},{n:"Hakan Ünsal",pos:["CM","CDM"],r:73},
  {n:"Tayfur Havutçu",pos:["CM","CDM"],r:72},{n:"Muzzy Izzet",pos:["CM","CDM"],r:72},
  {n:"Yıldıray Baştürk",pos:["CM","CAM"],r:76},{n:"Hasan Şaş",pos:["LW","RW"],r:74},
  {n:"Arif Erdem",pos:["LW","ST"],r:73},{n:"Abdullah Ercan",pos:["CM","LW"],r:70},
  {n:"Emre Belözoğlu",pos:["CM","CAM"],r:78},{n:"Nihat Kahveci",pos:["ST","LW"],r:77},
  {n:"İlhan Mansız",pos:["ST","LW"],r:75},{n:"Hakan Şükür",pos:["ST"],r:83}
 ]}
 ],
 "Mexico":[
  ,
  {y:2018,p:[
  {n:"Guillermo Ochoa",pos:["GK"],r:82},
  {n:"Alfredo Talavera",pos:["GK"],r:76},
  {n:"Jose de Jesus Corona",pos:["GK"],r:75},
  {n:"Jorge Sanchez",pos:["RB","RWB"],r:72},
  {n:"Rafael Marquez",pos:["CB","CDM"],r:79},
  {n:"Hugo Ayala",pos:["CB"],r:73},
  {n:"Hector Moreno",pos:["CB"],r:79},
  {n:"Carlos Salcedo",pos:["CB","RB"],r:76},
  {n:"Miguel Layun",pos:["LB","RB","LWB"],r:77},
  {n:"Jesus Gallardo",pos:["LB","LWB"],r:75},
  {n:"Andres Guardado",pos:["CDM","CM","LW"],r:81},
  {n:"Hector Herrera",pos:["CM","CDM"],r:80},
  {n:"Jonathan dos Santos",pos:["CM","CDM"],r:77},
  {n:"Edson Alvarez",pos:["CDM","CB"],r:74},
  {n:"Erick Gutierrez",pos:["CM","CDM"],r:73},
  {n:"Carlos Vela",pos:["LW","RW","ST"],r:82},
  {n:"Hirving Lozano",pos:["RW","LW"],r:81},
  {n:"Marco Fabian",pos:["CAM","CM"],r:75},
  {n:"Javier Aquino",pos:["LW","RW"],r:73},
  {n:"Giovani dos Santos",pos:["LW","CAM"],r:74},
  {n:"Jesus Manuel Corona",pos:["RW","LW"],r:74},
  {n:"Javier Hernandez",pos:["ST"],r:83},
  {n:"Raul Jimenez",pos:["ST","LW"],r:79},
  {n:"Oribe Peralta",pos:["ST"],r:73}
 ]},
  {y:2022,p:[
  {n:"Guillermo Ochoa",pos:["GK"],r:82},
  {n:"Alfredo Talavera",pos:["GK"],r:74},
  {n:"Rodolfo Cota",pos:["GK"],r:73},
  {n:"Jorge Sanchez",pos:["RB","RWB"],r:74},
  {n:"Kevin Alvarez",pos:["RB","CB"],r:72},
  {n:"Nestor Araujo",pos:["CB"],r:77},
  {n:"Hector Moreno",pos:["CB"],r:78},
  {n:"Johan Vasquez",pos:["CB"],r:75},
  {n:"Cesar Montes",pos:["CB"],r:76},
  {n:"Jesus Gallardo",pos:["LB","LWB"],r:76},
  {n:"Gerardo Arteaga",pos:["LB","LWB"],r:73},
  {n:"Edson Alvarez",pos:["CDM","CB","CM"],r:81},
  {n:"Andres Guardado",pos:["CDM","CM"],r:78},
  {n:"Hector Herrera",pos:["CM","CDM"],r:79},
  {n:"Carlos Rodriguez",pos:["CM","CDM"],r:73},
  {n:"Luis Romo",pos:["CDM","CM"],r:74},
  {n:"Luis Chavez",pos:["LW","CM"],r:75},
  {n:"Orbelin Pineda",pos:["CM","CAM"],r:75},
  {n:"Alexis Vega",pos:["LW","CAM"],r:74},
  {n:"Uriel Antuna",pos:["LW","RW"],r:72},
  {n:"Hirving Lozano",pos:["RW","LW"],r:82},
  {n:"Roberto Alvarado",pos:["CAM","LW"],r:74},
  {n:"Rogelio Funes Mori",pos:["ST"],r:75},
  {n:"Henry Martin",pos:["ST"],r:73},
  {n:"Raul Jimenez",pos:["ST","LW"],r:81},
  {n:"Erick Gutierrez",pos:["CM","CDM"],r:73}
 ]},
  {y:2026,p:[
  {n:"Guillermo Ochoa",pos:["GK"],r:80},{n:"Carlos Acevedo",pos:["GK"],r:74},{n:"Raul Rangel",pos:["GK"],r:72},
  {n:"Jorge Sanchez",pos:["RB","RWB"],r:75},{n:"Israel Reyes",pos:["RB","CB"],r:72},
  {n:"Cesar Montes",pos:["CB"],r:78},{n:"Johan Vasquez",pos:["CB"],r:76},
  {n:"Gilberto Mora",pos:["CB","LB"],r:73},{n:"Jesús Gallardo",pos:["LB","LWB"],r:76},
  {n:"Edson Alvarez",pos:["CDM","CM","CB"],r:82},{n:"Luis Romo",pos:["CDM","CM"],r:75},
  {n:"Luis Chavez",pos:["CM","LW"],r:77},{n:"Obed Vargas",pos:["CDM","CM"],r:73},
  {n:"Érik Lira",pos:["CDM","CM"],r:72},{n:"Orbelin Pineda",pos:["CM","CAM"],r:76},
  {n:"Alvaro Fidalgo",pos:["CM","CAM"],r:76},{n:"Roberto Alvarado",pos:["CAM","LW"],r:76},
  {n:"Brian Gutierrez",pos:["LW","CAM"],r:74},{n:"Alexis Vega",pos:["LW","CAM"],r:75},
  {n:"Cesar Huerta",pos:["LW","RW"],r:75},{n:"Armando Gonzalez",pos:["LW","RW"],r:70},
  {n:"Julian Quiñones",pos:["ST","LW"],r:77},{n:"Raul Jimenez",pos:["ST"],r:79},
  {n:"Guillermo Martinez",pos:["ST"],r:71},{n:"Santiago Gimenez",pos:["ST"],r:83},
  {n:"Mateo Chavez",pos:["CM"],r:69}
 ]},
  {y:2006,p:[
  {n:"Oswaldo Sánchez",pos:["GK"],r:79},{n:"Guillermo Ochoa",pos:["GK"],r:75},{n:"José de Jesús Corona",pos:["GK"],r:73},
  {n:"Francisco Javier Rodríguez",pos:["RB","CB"],r:77},{n:"Rafael Márquez",pos:["CB","CDM"],r:85},
  {n:"Claudio Suárez",pos:["CB"],r:77},{n:"Mario Méndez",pos:["CB"],r:73},
  {n:"Carlos Salcido",pos:["LB","CB"],r:77},{n:"Ricardo Osorio",pos:["RB","CB"],r:74},
  {n:"Pável Pardo",pos:["CDM","CM"],r:78},{n:"Gerardo Torrado",pos:["CM","CDM"],r:77},
  {n:"Gonzalo Pineda",pos:["CM","CDM"],r:73},{n:"Jesús Arellano",pos:["CM"],r:70},
  {n:"José Antonio Castro",pos:["CM"],r:69},{n:"Ramón Morales",pos:["CM","LW"],r:73},
  {n:"Luis Ernesto Pérez",pos:["CM","LW"],r:71},{n:"Andrés Guardado",pos:["LW","CM"],r:76},
  {n:"Rafael García",pos:["LW","RW"],r:71},{n:"Francisco Fonseca",pos:["LW","ST"],r:70},
  {n:"Sinha",pos:["CAM","LW"],r:73},{n:"Omar Bravo",pos:["ST","LW"],r:76},
  {n:"Guillermo Franco",pos:["ST"],r:74},{n:"Jared Borgetti",pos:["ST"],r:79}
 ]},
  {y:2010,p:[
  {n:"Guillermo Ochoa",pos:["GK"],r:80},{n:"Óscar Pérez",pos:["GK"],r:75},{n:"Luis Ernesto Michel",pos:["GK"],r:73},
  {n:"Francisco Javier Rodríguez",pos:["RB","CB"],r:76},{n:"Rafael Márquez",pos:["CB","CDM"],r:83},
  {n:"Jonny Magallón",pos:["CB"],r:73},{n:"Héctor Moreno",pos:["CB"],r:75},
  {n:"Carlos Salcido",pos:["LB","CB"],r:76},{n:"Ricardo Osorio",pos:["RB","CB"],r:72},
  {n:"Paul Aguilar",pos:["RB","CM"],r:73},{n:"Gerardo Torrado",pos:["CDM","CM"],r:76},
  {n:"Efraín Juárez",pos:["CDM","CM"],r:72},{n:"Israel Castro",pos:["CM","CDM"],r:72},
  {n:"Jorge Torres Nilo",pos:["LB","CDM"],r:71},{n:"Pablo Barrera",pos:["LW","CM"],r:72},
  {n:"Adolfo Bautista",pos:["LW","CM"],r:70},{n:"Andrés Guardado",pos:["LW","CM"],r:79},
  {n:"Giovani dos Santos",pos:["LW","CAM"],r:77},{n:"Carlos Vela",pos:["LW","ST"],r:78},
  {n:"Cuauhtémoc Blanco",pos:["CAM","ST"],r:77},{n:"Alberto Medina",pos:["ST"],r:71},
  {n:"Guillermo Franco",pos:["ST"],r:72},{n:"Javier Hernández",pos:["ST"],r:80}
 ]},
  {y:2014,p:[
  {n:"Guillermo Ochoa",pos:["GK"],r:81},{n:"Alfredo Talavera",pos:["GK"],r:74},{n:"José de Jesús Corona",pos:["GK"],r:74},
  {n:"Paul Aguilar",pos:["RB","CM"],r:74},{n:"Francisco Javier Rodríguez",pos:["RB","CB"],r:76},
  {n:"Diego Reyes",pos:["CB"],r:74},{n:"Héctor Moreno",pos:["CB"],r:77},
  {n:"Miguel Ángel Ponce",pos:["LB","CB"],r:71},{n:"Carlos Salcido",pos:["LB","CB"],r:74},
  {n:"Miguel Layún",pos:["LB","RB"],r:75},{n:"Héctor Herrera",pos:["CM","CDM"],r:78},
  {n:"Rafael Márquez",pos:["CDM","CB"],r:79},{n:"Andrés Guardado",pos:["CDM","CM"],r:80},
  {n:"Carlos Peña",pos:["CM","CDM"],r:72},{n:"José Juan Vázquez",pos:["CM","CDM"],r:70},
  {n:"Javier Aquino",pos:["LW","RW"],r:73},{n:"Isaác Brizuela",pos:["LW","CM"],r:72},
  {n:"Marco Fabián",pos:["CAM","CM"],r:74},{n:"Giovani dos Santos",pos:["LW","CAM"],r:76},
  {n:"Alan Pulido",pos:["ST","LW"],r:72},{n:"Oribe Peralta",pos:["ST"],r:76},
  {n:"Raúl Jiménez",pos:["ST","LW"],r:76},{n:"Javier Hernández",pos:["ST"],r:84}
 ]},
  {y:1994,p:[
  {n:"Jorge Campos",pos:["GK"],r:79},{n:"Adrián Chávez",pos:["GK"],r:74},{n:"Félix Fernández",pos:["GK"],r:71},
  {n:"Jorge Rodríguez",pos:["RB","CB"],r:72},{n:"Claudio Suárez",pos:["CB"],r:78},
  {n:"Juan Carlos Chávez",pos:["CB"],r:73},{n:"Marcelino Bernal",pos:["CB","CDM"],r:72},
  {n:"Joaquín del Olmo",pos:["LB","CB"],r:71},{n:"Luis Antonio Valdéz",pos:["LB"],r:70},
  {n:"Gerardo Torrado",pos:["CDM","CM"],r:71},{n:"José Luis Salgado",pos:["CM","CDM"],r:70},
  {n:"Juan de Dios Ramírez Perales",pos:["CM","CDM"],r:70},{n:"Ignacio Ambríz",pos:["CM","CAM"],r:72},
  {n:"Benjamín Galindo",pos:["CAM","CM"],r:76},{n:"Ramón Ramírez",pos:["CM","LW"],r:75},
  {n:"Missael Espinoza",pos:["LW","CM"],r:71},{n:"Alberto García Aspe",pos:["CM","CAM"],r:79},
  {n:"Luis García Postigo",pos:["LW","ST"],r:74},{n:"Carlos Hermosillo",pos:["ST"],r:73},
  {n:"Luis Miguel Salvador",pos:["LW","ST"],r:70},{n:"Zague",pos:["ST"],r:74},
  {n:"Hugo Sánchez",pos:["ST"],r:81}
 ]},
  {y:1998,p:[
  {n:"Jorge Campos",pos:["GK"],r:77},{n:"Oswaldo Sánchez",pos:["GK"],r:75},{n:"Óscar Pérez",pos:["GK"],r:73},
  {n:"Salvador Carmona",pos:["RB","CB"],r:73},{n:"Claudio Suárez",pos:["CB"],r:77},
  {n:"Duilio Davino",pos:["CB"],r:73},{n:"Joel Sánchez",pos:["CB","LB"],r:72},
  {n:"Marcelino Bernal",pos:["CB","CDM"],r:71},{n:"Isaac Terrazas",pos:["LB","CB"],r:70},
  {n:"Braulio Luna",pos:["RB","CM"],r:71},{n:"Gerardo Torrado",pos:["CDM","CM"],r:74},
  {n:"Pável Pardo",pos:["CM","CDM"],r:77},{n:"Ramón Ramírez",pos:["CM","CAM"],r:74},
  {n:"Jesús Arellano",pos:["CM","LW"],r:72},{n:"Jaime Ordiales",pos:["CM","CDM"],r:70},
  {n:"Germán Villa",pos:["CM","LW"],r:70},{n:"Ricardo Peláez",pos:["CAM","CM"],r:73},
  {n:"Francisco Palencia",pos:["LW","ST"],r:73},{n:"Alberto García Aspe",pos:["CM","CAM"],r:77},
  {n:"Raúl Lara",pos:["LW","ST"],r:70},{n:"Luis García Postigo",pos:["LW","ST"],r:73},
  {n:"Luis Hernández",pos:["ST"],r:77},{n:"Cuauhtémoc Blanco",pos:["CAM","ST"],r:81}
 ]},
  {y:2002,p:[
  {n:"Oswaldo Sánchez",pos:["GK"],r:79},{n:"Óscar Pérez",pos:["GK"],r:75},{n:"Jorge Campos",pos:["GK"],r:73},
  {n:"Francisco Gabriel de Anda",pos:["RB","CB"],r:72},{n:"Rafael Márquez",pos:["CB","CDM"],r:82},
  {n:"Salvador Carmona",pos:["CB"],r:73},{n:"Alberto Rodríguez",pos:["CB","LB"],r:70},
  {n:"Germán Villa",pos:["LB","CB"],r:70},{n:"Manuel Vidrio",pos:["LB","CB"],r:70},
  {n:"Gerardo Torrado",pos:["CDM","CM"],r:75},{n:"Sigifredo Mercado",pos:["CM","CDM"],r:70},
  {n:"Jesús Arellano",pos:["CM","LW"],r:72},{n:"Ramón Morales",pos:["CM","LW"],r:73},
  {n:"Alberto García Aspe",pos:["CM","CAM"],r:76},{n:"Braulio Luna",pos:["LB","CM"],r:70},
  {n:"Johan Rodríguez",pos:["LW","CM"],r:70},{n:"Rafael García",pos:["LW","RW"],r:71},
  {n:"Gabriel Caballero",pos:["LW","CM"],r:70},{n:"Melvin Brown",pos:["CDM","CM"],r:71},
  {n:"Francisco Palencia",pos:["LW","ST"],r:73},{n:"Jared Borgetti",pos:["ST"],r:77},
  {n:"Luis Hernández",pos:["ST"],r:74},{n:"Cuauhtémoc Blanco",pos:["CAM","ST"],r:80}
 ]}
 ],
 "Denmark":[
  ,
  {y:2018,p:[
  {n:"Kasper Schmeichel",pos:["GK"],r:83},
  {n:"Jonas Lossl",pos:["GK"],r:74},
  {n:"Frederik Ronnow",pos:["GK"],r:73},
  {n:"Henrik Dalsgaard",pos:["RB","CB"],r:73},
  {n:"Mathias Jorgensen",pos:["CB"],r:74},
  {n:"Andreas Christensen",pos:["CB"],r:82},
  {n:"Simon Kjaer",pos:["CB"],r:82},
  {n:"Jannik Vestergaard",pos:["CB"],r:76},
  {n:"Jonas Knudsen",pos:["LB","LWB"],r:71},
  {n:"Jens Stryger Larsen",pos:["RB","RWB"],r:74},
  {n:"William Kvist",pos:["CDM","CM"],r:74},
  {n:"Thomas Delaney",pos:["CM","CDM"],r:79},
  {n:"Lasse Schone",pos:["CM","CAM"],r:75},
  {n:"Lukas Lerager",pos:["CM"],r:70},
  {n:"Christian Eriksen",pos:["CAM","CM"],r:87},
  {n:"Pione Sisto",pos:["LW","RW"],r:74},
  {n:"Viktor Fischer",pos:["RW","LW"],r:72},
  {n:"Michael Krohn-Dehli",pos:["CAM","LW"],r:72},
  {n:"Martin Braithwaite",pos:["ST","LW"],r:75},
  {n:"Yussuf Poulsen",pos:["ST","LW"],r:77},
  {n:"Kasper Dolberg",pos:["ST"],r:76},
  {n:"Nicolai Jorgensen",pos:["ST"],r:75},
  {n:"Andreas Cornelius",pos:["ST"],r:74}
 ]},
  {y:2022,p:[
  {n:"Kasper Schmeichel",pos:["GK"],r:82},
  {n:"Frederik Ronnow",pos:["GK"],r:75},
  {n:"Oliver Christensen",pos:["GK"],r:73},
  {n:"Rasmus Kristensen",pos:["RB","RWB"],r:76},
  {n:"Alexander Bah",pos:["RB","CB"],r:74},
  {n:"Andreas Christensen",pos:["CB"],r:85},
  {n:"Simon Kjaer",pos:["CB"],r:82},
  {n:"Joachim Andersen",pos:["CB"],r:80},
  {n:"Victor Nelsson",pos:["CB"],r:74},
  {n:"Joakim Maehle",pos:["LB","LWB","RWB"],r:78},
  {n:"Jens Stryger Larsen",pos:["RB","RWB"],r:74},
  {n:"Pierre-Emile Hojbjerg",pos:["CDM","CM"],r:83},
  {n:"Thomas Delaney",pos:["CM","CDM"],r:79},
  {n:"Christian Norgaard",pos:["CDM","CM"],r:77},
  {n:"Daniel Wass",pos:["CM","RW","RB"],r:75},
  {n:"Mathias Jensen",pos:["CM","CAM"],r:75},
  {n:"Christian Eriksen",pos:["CAM","CM"],r:86},
  {n:"Mikkel Damsgaard",pos:["LW","CAM"],r:77},
  {n:"Andreas Skov Olsen",pos:["RW","LW"],r:76},
  {n:"Robert Skov",pos:["RW","LW"],r:73},
  {n:"Jesper Lindstrom",pos:["RW","CAM"],r:75},
  {n:"Yussuf Poulsen",pos:["ST","LW"],r:77},
  {n:"Jonas Wind",pos:["ST"],r:75},
  {n:"Kasper Dolberg",pos:["ST"],r:76},
  {n:"Martin Braithwaite",pos:["ST","LW"],r:75},
  {n:"Andreas Cornelius",pos:["ST"],r:74}
 ]},
  {y:2010,p:[
  {n:"Thomas Sørensen",pos:["GK"],r:77},{n:"Stephan Andersen",pos:["GK"],r:74},{n:"Jesper Christiansen",pos:["GK"],r:73},
  {n:"Lars Jacobsen",pos:["RB","CB"],r:73},{n:"Daniel Agger",pos:["CB"],r:82},
  {n:"Simon Kjær",pos:["CB"],r:79},{n:"Per Krøldrup",pos:["CB"],r:73},
  {n:"Simon Poulsen",pos:["LB","LWB"],r:72},{n:"Patrick Mtiliga",pos:["LB","CB"],r:70},
  {n:"William Kvist",pos:["CDM","CM"],r:74},{n:"Christian Poulsen",pos:["CDM","CM"],r:76},
  {n:"Thomas Kahlenberg",pos:["CM","CAM"],r:73},{n:"Daniel Jensen",pos:["CM","CDM"],r:72},
  {n:"Martin Jørgensen",pos:["CM","RW"],r:73},{n:"Jakob Poulsen",pos:["CM"],r:71},
  {n:"Jesper Grønkjær",pos:["RW","LW"],r:74},{n:"Dennis Rommedahl",pos:["RW","LW"],r:76},
  {n:"Thomas Enevoldsen",pos:["LW","ST"],r:71},{n:"Mikkel Beckmann",pos:["ST","LW"],r:70},
  {n:"Søren Larsen",pos:["ST"],r:71},{n:"Nicklas Bendtner",pos:["ST"],r:79},
  {n:"Jon Dahl Tomasson",pos:["ST","CAM"],r:78},{n:"Christian Eriksen",pos:["CAM","CM"],r:79}
 ]},
  {y:1998,p:[
  {n:"Peter Schmeichel",pos:["GK"],r:91},{n:"Mogens Krogh",pos:["GK"],r:74},{n:"Peter Kjær",pos:["GK"],r:72},
  {n:"Jacob Laursen",pos:["RB","CB"],r:75},{n:"Marc Rieper",pos:["CB"],r:78},
  {n:"Jes Høgh",pos:["CB"],r:74},{n:"Michael Schjønberg",pos:["CB","LB"],r:73},
  {n:"Jan Heintze",pos:["LB","LWB"],r:74},{n:"Søren Colding",pos:["RB","LB"],r:70},
  {n:"Stig Tøfting",pos:["CDM","CM"],r:76},{n:"Per Frandsen",pos:["CM","CDM"],r:75},
  {n:"Morten Wieghorst",pos:["CM","CDM"],r:73},{n:"Allan Nielsen",pos:["CM","CDM"],r:73},
  {n:"Bjarne Goldbæk",pos:["CM","LW"],r:72},{n:"Martin Jørgensen",pos:["CM","RW"],r:73},
  {n:"Thomas Helveg",pos:["RB","CM"],r:76},{n:"Miklos Molnar",pos:["ST","LW"],r:71},
  {n:"René Henriksen",pos:["CB","CDM"],r:74},{n:"Ebbe Sand",pos:["ST"],r:76},
  {n:"Peter Møller",pos:["ST","LW"],r:73},{n:"Brian Laudrup",pos:["RW","CAM"],r:87},
  {n:"Michael Laudrup",pos:["CAM","CM"],r:89}
 ]},
  {y:2002,p:[
  {n:"Thomas Sørensen",pos:["GK"],r:78},{n:"Peter Kjær",pos:["GK"],r:72},{n:"Jesper Christiansen",pos:["GK"],r:72},
  {n:"Thomas Helveg",pos:["RB","CB"],r:76},{n:"Martin Laursen",pos:["CB"],r:80},
  {n:"René Henriksen",pos:["CB"],r:73},{n:"Niclas Jensen",pos:["LB","CB"],r:73},
  {n:"Jan Heintze",pos:["LB","LWB"],r:72},{n:"Kasper Bøgelund",pos:["RB","CB"],r:73},
  {n:"Stig Tøfting",pos:["CDM","CM"],r:76},{n:"Thomas Gravesen",pos:["CDM","CM"],r:78},
  {n:"Christian Poulsen",pos:["CDM","CM"],r:74},{n:"Martin Jørgensen",pos:["CM","RW"],r:74},
  {n:"Claus Jensen",pos:["CM","CAM"],r:74},{n:"Brian Steen Nielsen",pos:["CM","LW"],r:71},
  {n:"Jesper Grønkjær",pos:["RW","LW"],r:75},{n:"Dennis Rommedahl",pos:["RW","LW"],r:76},
  {n:"Jan Michaelsen",pos:["CM"],r:69},{n:"Peter Madsen",pos:["ST","LW"],r:71},
  {n:"Peter Løvenkrands",pos:["LW","ST"],r:72},{n:"Ebbe Sand",pos:["ST"],r:77},
  {n:"Jon Dahl Tomasson",pos:["ST","CAM"],r:78}
 ]},
  {y:1986,p:[
  {n:"Ole Qvist",pos:["GK"],r:74},{n:"Lars Høgh",pos:["GK"],r:74},{n:"Flemming Christensen",pos:["GK"],r:70},
  {n:"John Sivebæk",pos:["RB","RWB"],r:76},{n:"Ivan Nielsen",pos:["CB"],r:74},
  {n:"Kent Nielsen",pos:["CB"],r:76},{n:"Søren Busk",pos:["CB","LB"],r:73},
  {n:"Morten Olsen",pos:["CB","CDM"],r:79},{n:"Henrik Andersen",pos:["LB","CB"],r:73},
  {n:"Søren Lerby",pos:["CDM","CM"],r:79},{n:"Jan Mølby",pos:["CM","CDM"],r:78},
  {n:"Klaus Berggreen",pos:["CM","RW"],r:73},{n:"Per Frimann",pos:["CM","LW"],r:72},
  {n:"Frank Arnesen",pos:["CM","CAM"],r:77},{n:"Jens Jørn Bertelsen",pos:["LW","CM"],r:71},
  {n:"Jan Bartram",pos:["LW","CM"],r:72},{n:"Troels Rasmussen",pos:["LW","ST"],r:70},
  {n:"John Eriksen",pos:["LW","ST"],r:73},{n:"Jesper Olsen",pos:["LW","RW"],r:77},
  {n:"Michael Laudrup",pos:["CAM","CM"],r:87},{n:"Preben Elkjær",pos:["ST","LW"],r:84},
  {n:"Allan Simonsen",pos:["ST","CAM"],r:78}
 ]}
 ],
 "Sweden":[
  ,
  {y:2018,p:[
  {n:"Robin Olsen",pos:["GK"],r:78},
  {n:"Karl-Johan Johnsson",pos:["GK"],r:74},
  {n:"Kristoffer Nordfeldt",pos:["GK"],r:73},
  {n:"Mikael Lustig",pos:["RB","CB"],r:77},
  {n:"Emil Krafth",pos:["RB","CB"],r:74},
  {n:"Victor Lindelof",pos:["CB"],r:82},
  {n:"Andreas Granqvist",pos:["CB"],r:80},
  {n:"Pontus Jansson",pos:["CB"],r:79},
  {n:"Filip Helander",pos:["CB"],r:76},
  {n:"Martin Olsson",pos:["LB","LWB"],r:75},
  {n:"Ludwig Augustinsson",pos:["LB","LWB"],r:76},
  {n:"Albin Ekdal",pos:["CDM","CM"],r:76},
  {n:"Gustav Svensson",pos:["CDM","CM"],r:73},
  {n:"Oscar Hiljemark",pos:["CM"],r:72},
  {n:"Sebastian Larsson",pos:["CM","RW"],r:76},
  {n:"Emil Forsberg",pos:["LW","CAM","RW"],r:81},
  {n:"Marcus Rohden",pos:["CM","RW"],r:72},
  {n:"Viktor Claesson",pos:["CM","RW"],r:73},
  {n:"Jimmy Durmaz",pos:["LW","CM"],r:72},
  {n:"Marcus Berg",pos:["ST"],r:74},
  {n:"John Guidetti",pos:["ST","LW"],r:73},
  {n:"Ola Toivonen",pos:["ST","CAM"],r:75},
  {n:"Isaac Kiese Thelin",pos:["ST"],r:72}
 ]},
  {y:2026,p:[
  {n:"Viktor Johansson",pos:["GK"],r:78},{n:"Kristoffer Nordfeldt",pos:["GK"],r:74},{n:"Jacob Widell Zetterström",pos:["GK"],r:72},
  {n:"Carl Starfelt",pos:["CB"],r:79},{n:"Victor Lindelof",pos:["CB"],r:82},
  {n:"Isak Hien",pos:["CB"],r:81},{n:"Gustaf Lagerbielke",pos:["CB"],r:77},
  {n:"Hjalmar Ekdal",pos:["CDM","CM"],r:75},{n:"Daniel Svensson",pos:["RB","RWB"],r:74},
  {n:"Gabriel Gudmundsson",pos:["LB","LWB"],r:75},{n:"Alexander Bernhardsson",pos:["RB","CB"],r:72},
  {n:"Jesper Karlstrom",pos:["CDM","CM"],r:74},{n:"Eric Smith",pos:["CDM","CM"],r:75},
  {n:"Mattias Svanberg",pos:["CM","CDM"],r:77},{n:"Lucas Bergvall",pos:["CM","CAM"],r:80},
  {n:"Yasin Ayari",pos:["CM","CAM"],r:76},{n:"Emil Forsberg",pos:["LW","CAM","RW"],r:79},
  {n:"Anthony Elanga",pos:["RW","LW"],r:80},{n:"Taha Ali",pos:["LW","RW"],r:73},
  {n:"Ken Sema",pos:["LW","RW"],r:74},{n:"Besfort Zeneli",pos:["LW","CAM"],r:73},
  {n:"Elliot Stroud",pos:["RW","LW"],r:73},{n:"Benjamin Nygren",pos:["ST","LW"],r:74},
  {n:"Gustaf Nilsson",pos:["ST"],r:77},{n:"Alexander Isak",pos:["ST","LW"],r:89},
  {n:"Viktor Gyokeres",pos:["ST"],r:90}
 ]},
  {y:2006,p:[
  {n:"Andreas Isaksson",pos:["GK"],r:78},{n:"Rami Shaaban",pos:["GK"],r:73},{n:"John Alvbåge",pos:["GK"],r:71},
  {n:"Mikael Nilsson",pos:["RB","CM"],r:72},{n:"Olof Mellberg",pos:["CB"],r:80},
  {n:"Petter Hansson",pos:["CB"],r:73},{n:"Teddy Lučić",pos:["CB","LB"],r:74},
  {n:"Erik Edman",pos:["LB","CB"],r:73},{n:"Fredrik Stenman",pos:["LB"],r:70},
  {n:"Karl Svensson",pos:["CDM","CM"],r:71},{n:"Tobias Linderoth",pos:["CDM","CM"],r:74},
  {n:"Daniel Andersson",pos:["CM","CDM"],r:72},{n:"Niclas Alexandersson",pos:["CM","RW"],r:74},
  {n:"Anders Svensson",pos:["CM","CAM"],r:76},{n:"Christian Wilhelmsson",pos:["RW","LW"],r:73},
  {n:"Kim Källström",pos:["CM","CAM"],r:78},{n:"Freddie Ljungberg",pos:["CM","LW"],r:82},
  {n:"Mattias Jonson",pos:["LW","RW"],r:73},{n:"Markus Rosenberg",pos:["ST","LW"],r:73},
  {n:"Johan Elmander",pos:["ST","LW"],r:74},{n:"Marcus Allbäck",pos:["ST"],r:73},
  {n:"Henrik Larsson",pos:["ST","LW"],r:83},{n:"Zlatan Ibrahimović",pos:["ST","LW"],r:86}
 ]},
  {y:1994,p:[
  {n:"Thomas Ravelli",pos:["GK"],r:81},{n:"Magnus Hedman",pos:["GK"],r:76},{n:"Lars Eriksson",pos:["GK"],r:70},
  {n:"Roland Nilsson",pos:["RB","RWB"],r:78},{n:"Patrik Andersson",pos:["CB"],r:78},
  {n:"Joachim Björklund",pos:["CB"],r:75},{n:"Teddy Lučić",pos:["CB","LB"],r:73},
  {n:"Roger Ljung",pos:["LB","LWB"],r:73},{n:"Pontus Kåmark",pos:["RB","CM"],r:73},
  {n:"Jonas Thern",pos:["CDM","CM"],r:79},{n:"Stefan Rehn",pos:["CM","CDM"],r:73},
  {n:"Klas Ingesson",pos:["CM","CDM"],r:76},{n:"Mikael Nilsson",pos:["RB","CM"],r:72},
  {n:"Stefan Schwarz",pos:["CM","CDM"],r:76},{n:"Magnus Erlingmark",pos:["CM","LW"],r:72},
  {n:"Håkan Mild",pos:["CAM","CM"],r:74},{n:"Anders Limpar",pos:["LW","RW"],r:77},
  {n:"Jesper Blomqvist",pos:["LW","LM"],r:75},{n:"Martin Dahlin",pos:["ST","LW"],r:78},
  {n:"Kennet Andersson",pos:["ST"],r:76},{n:"Henrik Larsson",pos:["ST","LW"],r:79},
  {n:"Tomas Brolin",pos:["CAM","ST"],r:80}
 ]},
  {y:2002,p:[
  {n:"Magnus Hedman",pos:["GK"],r:77},{n:"Andreas Isaksson",pos:["GK"],r:76},{n:"Tomas Antonelius",pos:["GK"],r:71},
  {n:"Patrik Andersson",pos:["RB","CB"],r:77},{n:"Olof Mellberg",pos:["CB"],r:78},
  {n:"Michael Svensson",pos:["CB"],r:73},{n:"Johan Mjällby",pos:["CB"],r:74},
  {n:"Andreas Jakobsson",pos:["CB","LB"],r:72},{n:"Teddy Lučić",pos:["CB","LB"],r:73},
  {n:"Erik Edman",pos:["LB","LWB"],r:72},{n:"Tobias Linderoth",pos:["CDM","CM"],r:73},
  {n:"Daniel Andersson",pos:["CM","CDM"],r:72},{n:"Anders Svensson",pos:["CM","CAM"],r:76},
  {n:"Magnus Kihlstedt",pos:["CM","CDM"],r:70},{n:"Pontus Farnerud",pos:["CM","LW"],r:71},
  {n:"Magnus Svensson",pos:["CM","LW"],r:70},{n:"Niclas Alexandersson",pos:["CM","RW"],r:74},
  {n:"Mattias Jonson",pos:["LW","RW"],r:73},{n:"Andreas Andersson",pos:["LW","ST"],r:72},
  {n:"Marcus Allbäck",pos:["ST"],r:74},{n:"Freddie Ljungberg",pos:["LW","CM"],r:83},
  {n:"Henrik Larsson",pos:["ST","LW"],r:85},{n:"Zlatan Ibrahimović",pos:["ST","LW"],r:77}
 ]},
  {y:1990,p:[
  {n:"Thomas Ravelli",pos:["GK"],r:80},{n:"Niklas Nyhlén",pos:["GK"],r:71},{n:"Sven Andersson",pos:["GK"],r:70},
  {n:"Roland Nilsson",pos:["RB","RWB"],r:77},{n:"Peter Larsson",pos:["CB"],r:74},
  {n:"Jan Eriksson",pos:["CB"],r:73},{n:"Lars Eriksson",pos:["CB","LB"],r:72},
  {n:"Roger Ljung",pos:["LB","LWB"],r:73},{n:"Joakim Nilsson",pos:["CB"],r:72},
  {n:"Glenn Strömberg",pos:["CDM","CM"],r:75},{n:"Jonas Thern",pos:["CDM","CM"],r:78},
  {n:"Klas Ingesson",pos:["CM","CDM"],r:75},{n:"Ulrik Jansson",pos:["CM"],r:70},
  {n:"Stefan Schwarz",pos:["CM","CDM"],r:74},{n:"Leif Engqvist",pos:["CM","LW"],r:70},
  {n:"Mats Gren",pos:["LW","CM"],r:71},{n:"Glenn Hysén",pos:["LW","CM"],r:73},
  {n:"Johnny Ekström",pos:["LW","ST"],r:73},{n:"Mats Magnusson",pos:["ST","LW"],r:72},
  {n:"Stefan Pettersson",pos:["ST","LW"],r:72},{n:"Tomas Brolin",pos:["CAM","ST"],r:76},
  {n:"Anders Limpar",pos:["LW","RW"],r:78}
 ]},
  {y:1970,p:[
  {n:"Ronnie Hellström",pos:["GK"],r:79},{n:"Örjan Persson",pos:["GK"],r:75},{n:"Sten Pålsson",pos:["GK"],r:70},
  {n:"Göran Nicklasson",pos:["RB","CB"],r:71},{n:"Björn Nordqvist",pos:["CB"],r:79},
  {n:"Bo Larsson",pos:["CB","LB"],r:74},{n:"Hans Selander",pos:["CB"],r:70},
  {n:"Jan Olsson",pos:["LB","CB"],r:72},{n:"Claes Cronqvist",pos:["LB"],r:70},
  {n:"Leif Eriksson",pos:["CDM","CM"],r:70},{n:"Krister Kristensson",pos:["CM","CDM"],r:71},
  {n:"Leif Målberg",pos:["CM","CDM"],r:70},{n:"Roland Grip",pos:["CM","CDM"],r:72},
  {n:"Ove Grahn",pos:["CM","LW"],r:71},{n:"Sven-Gunnar Larsson",pos:["LW","CM"],r:71},
  {n:"Tommy Svensson",pos:["LW","CM"],r:73},{n:"Inge Ejderstedt",pos:["LW","RW"],r:70},
  {n:"Kurt Axelsson",pos:["LW","ST"],r:70},{n:"Tomas Nordahl",pos:["ST"],r:70},
  {n:"Tom Turesson",pos:["ST","LW"],r:71},{n:"Ronney Pettersson",pos:["LW","ST"],r:71},
  {n:"Ove Kindvall",pos:["ST"],r:78}
 ]},
  {y:1974,p:[
  {n:"Ronnie Hellström",pos:["GK"],r:80},{n:"Örjan Persson",pos:["GK"],r:74},{n:"Benno Magnusson",pos:["GK"],r:70},
  {n:"Staffan Tapper",pos:["RB","CB"],r:71},{n:"Björn Nordqvist",pos:["CB"],r:79},
  {n:"Björn Andersson",pos:["CB"],r:74},{n:"Claes Cronqvist",pos:["CB","LB"],r:70},
  {n:"Jan Olsson",pos:["LB","CB"],r:72},{n:"Jörgen Augustsson",pos:["LB"],r:70},
  {n:"Göran Hagberg",pos:["CDM","CM"],r:72},{n:"Inge Ejderstedt",pos:["CM","CDM"],r:70},
  {n:"Sven-Gunnar Larsson",pos:["CM","CDM"],r:71},{n:"Kent Karlsson",pos:["CM"],r:71},
  {n:"Roland Grip",pos:["CM","CDM"],r:72},{n:"Sven Lindman",pos:["CM","LW"],r:70},
  {n:"Bo Larsson",pos:["CB","LB"],r:73},{n:"Roland Sandberg",pos:["LW","CM"],r:72},
  {n:"Ove Grahn",pos:["LW","RW"],r:71},{n:"Conny Torstensson",pos:["LW","ST"],r:74},
  {n:"Thomas Ahlström",pos:["ST","LW"],r:70},{n:"Ralf Edström",pos:["ST"],r:76},
  {n:"Ove Kindvall",pos:["ST"],r:75}
 ]},
  {y:1978,p:[
  {n:"Ronnie Hellström",pos:["GK"],r:80},{n:"Jan Möller",pos:["GK"],r:71},{n:"Olle Nordin",pos:["GK"],r:70},
  {n:"Roland Andersson",pos:["RB","CB"],r:70},{n:"Björn Nordqvist",pos:["CB"],r:77},
  {n:"Staffan Tapper",pos:["CB"],r:71},{n:"Magnus Andersson",pos:["CB","LB"],r:70},
  {n:"Roy Andersson",pos:["LB","CB"],r:70},{n:"Ronald Åhman",pos:["LB"],r:70},
  {n:"Anders Linderoth",pos:["CDM","CM"],r:74},{n:"Göran Hagberg",pos:["CM","CDM"],r:71},
  {n:"Benny Wendt",pos:["CM","CDM"],r:70},{n:"Kent Karlsson",pos:["CM"],r:70},
  {n:"Ingemar Erlandsson",pos:["CM","LW"],r:70},{n:"Sanny Åslund",pos:["LW","CM"],r:70},
  {n:"Hasse Borg",pos:["LW","CM"],r:72},{n:"Conny Torstensson",pos:["LW","RW"],r:74},
  {n:"Thomas Sjöberg",pos:["LW","ST"],r:71},{n:"Lennart Larsson",pos:["ST"],r:70},
  {n:"Torbjörn Nilsson",pos:["ST","LW"],r:71},{n:"Ralf Edström",pos:["ST"],r:75},
  {n:"Bo Larsson",pos:["CB","CM"],r:72}
 ]}
 ],
 "Morocco":[
  {y:2018,p:[
  {n:"Yassine Bounou",pos:["GK"],r:78},
  {n:"Munir Mohamedi",pos:["GK"],r:73},
  {n:"Ahmed Reda Tagnaouti",pos:["GK"],r:70},
  {n:"Achraf Hakimi",pos:["RB","RWB"],r:78},
  {n:"Medhi Benatia",pos:["CB"],r:82},
  {n:"Romain Saiss",pos:["CB","CDM"],r:77},
  {n:"Manuel da Costa",pos:["CB"],r:74},
  {n:"Hamza Mendyl",pos:["LB","LWB"],r:70},
  {n:"Karim El Ahmadi",pos:["CDM","CM"],r:76},
  {n:"Sofyan Amrabat",pos:["CDM","CM"],r:74},
  {n:"Youssef Ait Bennasser",pos:["CM","CDM"],r:72},
  {n:"Faycal Fajr",pos:["CM","CAM"],r:75},
  {n:"Nabil Dirar",pos:["RW","LW"],r:74},
  {n:"Hakim Ziyech",pos:["RW","CAM","LW"],r:79},
  {n:"Amine Harit",pos:["CAM","LW"],r:75},
  {n:"Mbark Boussoufa",pos:["CAM","CM"],r:74},
  {n:"Mehdi Carcela",pos:["RW","LW"],r:72},
  {n:"Nordin Amrabat",pos:["LW","RW"],r:72},
  {n:"Younes Belhanda",pos:["CAM","CM"],r:74},
  {n:"Khalid Boutaib",pos:["ST"],r:72},
  {n:"Ayoub El Kaabi",pos:["ST"],r:74},
  {n:"Aziz Bouhaddouz",pos:["ST"],r:70},
  {n:"Youssef En-Nesyri",pos:["ST"],r:73}
 ]},
  {y:2022,p:[
  {n:"Yassine Bounou",pos:["GK"],r:85},
  {n:"Munir Mohamedi",pos:["GK"],r:73},
  {n:"Ahmed Reda Tagnaouti",pos:["GK"],r:72},
  {n:"Achraf Hakimi",pos:["RB","RWB"],r:87},
  {n:"Noussair Mazraoui",pos:["RB","CB"],r:81},
  {n:"Nayef Aguerd",pos:["CB"],r:80},
  {n:"Romain Saiss",pos:["CB","CDM"],r:79},
  {n:"Jawad El Yamiq",pos:["CB"],r:73},
  {n:"Badr Benoun",pos:["CB"],r:72},
  {n:"Achraf Dari",pos:["CB","LB"],r:72},
  {n:"Yahia Attiyat Allah",pos:["LB","LWB"],r:73},
  {n:"Sofyan Amrabat",pos:["CDM","CM"],r:81},
  {n:"Selim Amallah",pos:["CM","CDM"],r:73},
  {n:"Azzedine Ounahi",pos:["CM","CAM"],r:76},
  {n:"Bilal El Khannous",pos:["CM","CAM"],r:73},
  {n:"Yahya Jabrane",pos:["CDM","CM"],r:72},
  {n:"Hakim Ziyech",pos:["RW","CAM","LW"],r:82},
  {n:"Sofiane Boufal",pos:["LW","RW","CAM"],r:78},
  {n:"Abde Ezzalzouli",pos:["LW","RW"],r:74},
  {n:"Anass Zaroury",pos:["LW","RW"],r:74},
  {n:"Abdelhamid Sabiri",pos:["CM","CAM"],r:74},
  {n:"Ilias Chair",pos:["CAM","CM"],r:73},
  {n:"Walid Cheddira",pos:["ST"],r:73},
  {n:"Zakaria Aboukhlal",pos:["LW","ST"],r:75},
  {n:"Youssef En-Nesyri",pos:["ST"],r:80},
  {n:"Abderrazak Hamdallah",pos:["ST"],r:73}
 ]},
  {y:2026,p:[
  {n:"Bounou Yassine",pos:["GK"],r:86},{n:"El Kajioui Munir",pos:["GK"],r:74},{n:"Tagnaouti Ahmed Reda",pos:["GK"],r:73},
  {n:"Hakimi Achraf",pos:["RB","RWB"],r:89},{n:"Mazraoui Noussair",pos:["RB","CB"],r:83},
  {n:"El Ouahdi Zakaria",pos:["RB","CB"],r:75},{n:"Aguerd Nayef",pos:["CB"],r:81},
  {n:"Talbi Chemsdine",pos:["CB"],r:75},{n:"Diop Issa",pos:["CB"],r:74},
  {n:"El Aynaoui Neil",pos:["CB"],r:73},{n:"Halhal Redouane",pos:["LB","LWB"],r:74},
  {n:"Amrabat Sofyan",pos:["CDM","CM"],r:82},{n:"Ounahi Azzedine",pos:["CM","CAM"],r:78},
  {n:"El Mourabet Samir",pos:["CDM","CM"],r:73},{n:"Riad Chadi",pos:["CM","CDM"],r:72},
  {n:"Saibari Ismael",pos:["CM","LW"],r:75},{n:"El Khannouss Bilal",pos:["CM","CAM"],r:78},
  {n:"Diaz Brahim",pos:["LW","CM"],r:73},{n:"Rahimi Soufiane",pos:["LW","ST"],r:77},
  {n:"Ezzalzouli Abde",pos:["LW","RW"],r:77},{n:"Amaimouni Ayoube",pos:["LW","RW"],r:72},
  {n:"Bouaddi Ayyoub",pos:["CM","CAM"],r:72},{n:"El Kaabi Ayoub",pos:["ST"],r:78},
  {n:"Belammari Youssef",pos:["ST"],r:72},{n:"Salah Eddine Anass",pos:["CM","CDM"],r:72},
  {n:"Yassine Gessime",pos:["LW","ST"],r:71}
 ]},
  {y:1994,p:[
  {n:"Khalil Azmi",pos:["GK"],r:73},{n:"Ahmed Bahja",pos:["GK"],r:71},{n:"Zakaria Alaoui",pos:["GK"],r:70},
  {n:"Ahmed Masbahi",pos:["RB","CB"],r:71},{n:"Noureddine Naybet",pos:["CB"],r:79},
  {n:"Abdelmajid Bouyboud",pos:["CB"],r:72},{n:"Nacer Abdellah",pos:["CB","LB"],r:71},
  {n:"Rachid Neqrouz",pos:["LB","CB"],r:72},{n:"Rachid Daoudi",pos:["RB","CM"],r:70},
  {n:"Rachid Azzouzi",pos:["CDM","CM"],r:73},{n:"Said Dghay",pos:["CM","CDM"],r:70},
  {n:"El Arbi Hababi Hababi",pos:["CM","CDM"],r:71},{n:"Smahi Triki",pos:["CM"],r:70},
  {n:"Mohammed Chaouch",pos:["CM","CAM"],r:71},{n:"Tahar El Khalej",pos:["CM","LW"],r:72},
  {n:"Abdelkrim El Hadrioui",pos:["LW","RW"],r:71},{n:"Abdeslam Laghrissi",pos:["LW","CM"],r:70},
  {n:"Mohamed Samadi",pos:["LW","ST"],r:70},{n:"Hassan Kachloul",pos:["LW","CAM"],r:74},
  {n:"Hassan Nader",pos:["ST","LW"],r:71},{n:"Mustapha Hadji",pos:["CAM","LW"],r:78},
  {n:"Mustafa El Haddaoui",pos:["ST"],r:72}
 ]},
  {y:1998,p:[
  {n:"Driss Benzekri",pos:["GK"],r:72},{n:"Mustapha Chadili",pos:["GK"],r:71},{n:"Rachid Rokki",pos:["GK"],r:70},
  {n:"Abdelkader El Brazi",pos:["RB","CB"],r:72},{n:"Noureddine Naybet",pos:["CB"],r:78},
  {n:"Rachid Neqrouz",pos:["CB"],r:72},{n:"Abdelilah Saber",pos:["CB","LB"],r:71},
  {n:"Saïd Chiba",pos:["LB","CB"],r:70},{n:"Abderrahim Ouakili",pos:["LB"],r:70},
  {n:"Smahi Triki",pos:["CDM","CM"],r:70},{n:"Rachid Azzouzi",pos:["CM","CDM"],r:73},
  {n:"Gharib Amzine",pos:["CM","CDM"],r:70},{n:"Lahcen Abrami",pos:["CM"],r:70},
  {n:"Abdeljalil Hadda",pos:["CM","CAM"],r:71},{n:"Abdelkrim El Hadrioui",pos:["LW","RW"],r:71},
  {n:"Tahar El Khalej",pos:["CM","LW"],r:71},{n:"Youssef Chippo",pos:["CM","LW"],r:73},
  {n:"Jamal Sellami",pos:["LW","CM"],r:70},{n:"Salaheddine Bassir",pos:["LW","ST"],r:74},
  {n:"Ali Elkhattabi",pos:["ST","LW"],r:71},{n:"Youssef Rossi",pos:["ST"],r:71},
  {n:"Mustapha Hadji",pos:["CAM","LW"],r:79}
 ]},
  {y:1986,p:[
  {n:"Badou Zaki",pos:["GK"],r:80},{n:"Mustafa El Biyaz",pos:["GK"],r:71},{n:"Abdelkrim Merry",pos:["GK"],r:70},
  {n:"Lahcen Ouadani",pos:["RB","CB"],r:71},{n:"Abdelaziz Souleimani",pos:["CB"],r:73},
  {n:"Abdelmajid Lamriss",pos:["CB"],r:72},{n:"Mustafa Merry",pos:["CB","LB"],r:71},
  {n:"Salahdine Hmied",pos:["LB","CB"],r:70},{n:"Noureddine Bouyahyaoui",pos:["LB"],r:70},
  {n:"Mohammed Sahil",pos:["CDM","CM"],r:70},{n:"Abderrazak Khairi",pos:["CM","CDM"],r:72},
  {n:"Labid Khalifa",pos:["CM","CDM"],r:70},{n:"Fadel Jilal",pos:["CM"],r:70},
  {n:"Abdelfettah Rhiati",pos:["CM","LW"],r:70},{n:"Abdelfettah Mouddani",pos:["LW","CM"],r:70},
  {n:"Azzedine Amanallah",pos:["LW","RW"],r:71},{n:"Mustafa El Haddaoui",pos:["LW","ST"],r:72},
  {n:"Abdellah Bidane",pos:["LW","ST"],r:70},{n:"Abdeljalil Hadda",pos:["ST"],r:70},
  {n:"Mohamed Timoumi",pos:["CAM","CM"],r:75},{n:"Mouncif El Haddaoui",pos:["LW","CAM"],r:72},
  {n:"Aziz Bouderbala",pos:["CAM","LW"],r:74},{n:"Abdelmajid Dolmy",pos:["CAM","LW"],r:76}
 ]}
 ],
 "Belgium":[
  {y:2018,p:[
  {n:"Thibaut Courtois",pos:["GK"],r:90},
  {n:"Simon Mignolet",pos:["GK"],r:77},
  {n:"Koen Casteels",pos:["GK"],r:76},
  {n:"Toby Alderweireld",pos:["CB"],r:87},
  {n:"Jan Vertonghen",pos:["CB","LB"],r:86},
  {n:"Vincent Kompany",pos:["CB"],r:87},
  {n:"Thomas Meunier",pos:["RB","RWB"],r:81},
  {n:"Thomas Vermaelen",pos:["CB","LB"],r:77},
  {n:"Dedryck Boyata",pos:["CB"],r:76},
  {n:"Axel Witsel",pos:["CDM","CM"],r:84},
  {n:"Marouane Fellaini",pos:["CM","ST"],r:80},
  {n:"Youri Tielemans",pos:["CM","CAM"],r:80},
  {n:"Mousa Dembele",pos:["CM","CDM"],r:83},
  {n:"Leander Dendoncker",pos:["CM","CDM"],r:75},
  {n:"Eden Hazard",pos:["LW","CAM"],r:91},
  {n:"Kevin De Bruyne",pos:["CM","CAM"],r:91},
  {n:"Dries Mertens",pos:["ST","CAM","RW"],r:84},
  {n:"Nacer Chadli",pos:["LW","CAM"],r:77},
  {n:"Thorgan Hazard",pos:["LW","CM"],r:77},
  {n:"Yannick Carrasco",pos:["LW","LB"],r:80},
  {n:"Adnan Januzaj",pos:["RW","LW"],r:74},
  {n:"Romelu Lukaku",pos:["ST"],r:87},
  {n:"Michy Batshuayi",pos:["ST"],r:76}
 ]},
  {y:2022,p:[
  {n:"Thibaut Courtois",pos:["GK"],r:91},
  {n:"Simon Mignolet",pos:["GK"],r:76},
  {n:"Koen Casteels",pos:["GK"],r:79},
  {n:"Timothy Castagne",pos:["RB","RWB","CB"],r:80},
  {n:"Toby Alderweireld",pos:["CB"],r:84},
  {n:"Jan Vertonghen",pos:["CB","LB"],r:82},
  {n:"Thomas Meunier",pos:["RB","RWB"],r:80},
  {n:"Arthur Theate",pos:["CB","LB"],r:77},
  {n:"Wout Faes",pos:["CB"],r:76},
  {n:"Zeno Debast",pos:["CB"],r:72},
  {n:"Yannick Carrasco",pos:["LW","LB"],r:82},
  {n:"Thorgan Hazard",pos:["LW","CM"],r:78},
  {n:"Axel Witsel",pos:["CDM","CM"],r:82},
  {n:"Kevin De Bruyne",pos:["CM","CAM"],r:92},
  {n:"Amadou Onana",pos:["CDM","CM"],r:79},
  {n:"Leander Dendoncker",pos:["CDM","CM"],r:77},
  {n:"Hans Vanaken",pos:["CM","CAM"],r:79},
  {n:"Youri Tielemans",pos:["CM","CAM"],r:82},
  {n:"Eden Hazard",pos:["LW","CAM"],r:84},
  {n:"Charles De Ketelaere",pos:["CAM","LW"],r:77},
  {n:"Jeremy Doku",pos:["LW","RW"],r:78},
  {n:"Dries Mertens",pos:["ST","CAM","RW"],r:82},
  {n:"Leandro Trossard",pos:["LW","RW","CAM"],r:81},
  {n:"Lois Openda",pos:["ST","LW"],r:77},
  {n:"Romelu Lukaku",pos:["ST"],r:85},
  {n:"Michy Batshuayi",pos:["ST"],r:74}
 ]},
  {y:2026,p:[
  {n:"Thibaut Courtois",pos:["GK"],r:92},{n:"Senne Lammens",pos:["GK"],r:74},{n:"Mike Penders",pos:["GK"],r:71},
  {n:"Timothy Castagne",pos:["RB","RWB","CB"],r:81},{n:"Thomas Meunier",pos:["RB","RWB"],r:78},
  {n:"Zeno Debast",pos:["CB"],r:76},{n:"Arthur Theate",pos:["CB","LB"],r:79},
  {n:"Koni De Winter",pos:["CB"],r:74},{n:"Brandon Mechele",pos:["CB"],r:74},
  {n:"Maxim De Cuyper",pos:["LB","LWB"],r:76},{n:"Nathan Ngoy",pos:["LB","CB"],r:71},
  {n:"Kevin De Bruyne",pos:["CM","CAM"],r:91},{n:"Amadou Onana",pos:["CDM","CM"],r:83},
  {n:"Axel Witsel",pos:["CDM","CM"],r:79},{n:"Youri Tielemans",pos:["CM","CAM"],r:83},
  {n:"Nicolas Raskin",pos:["CDM","CM"],r:78},{n:"Hans Vanaken",pos:["CM","CAM"],r:79},
  {n:"Alexis Saelemaekers",pos:["RW","LW"],r:78},{n:"Jeremy Doku",pos:["LW","RW"],r:83},
  {n:"Charles De Ketelaere",pos:["CAM","LW"],r:82},{n:"Leandro Trossard",pos:["LW","RW","CAM"],r:84},
  {n:"Dodi Lukebakio",pos:["LW","RW"],r:79},{n:"Diego Moreira",pos:["LW","RW"],r:73},
  {n:"Matias Fernandez-Pardo",pos:["RW","LW"],r:72},{n:"Joaquin Seys",pos:["CM"],r:70},
  {n:"Romelu Lukaku",pos:["ST"],r:83}
 ]},
  {y:2014,p:[
  {n:"Thibaut Courtois",pos:["GK"],r:87},{n:"Simon Mignolet",pos:["GK"],r:78},{n:"Sammy Bossut",pos:["GK"],r:72},
  {n:"Anthony Vanden Borre",pos:["RB","CB"],r:74},{n:"Daniel Van Buyten",pos:["CB"],r:78},
  {n:"Vincent Kompany",pos:["CB"],r:88},{n:"Nicolas Lombaerts",pos:["CB"],r:74},
  {n:"Thomas Vermaelen",pos:["CB","LB"],r:79},{n:"Laurent Ciman",pos:["LB","CB"],r:73},
  {n:"Jan Vertonghen",pos:["CB","LB"],r:85},{n:"Toby Alderweireld",pos:["CB"],r:82},
  {n:"Axel Witsel",pos:["CDM","CM"],r:82},{n:"Marouane Fellaini",pos:["CM","ST"],r:80},
  {n:"Mousa Dembélé",pos:["CM","CDM"],r:82},{n:"Steven Defour",pos:["CM","CDM"],r:75},
  {n:"Kevin De Bruyne",pos:["CM","CAM"],r:85},{n:"Eden Hazard",pos:["LW","CAM"],r:88},
  {n:"Nacer Chadli",pos:["LW","CAM"],r:76},{n:"Adnan Januzaj",pos:["LW","RW"],r:75},
  {n:"Kevin Mirallas",pos:["LW","RW"],r:76},{n:"Dries Mertens",pos:["ST","CAM","RW"],r:78},
  {n:"Divock Origi",pos:["ST","LW"],r:74},{n:"Romelu Lukaku",pos:["ST"],r:83}
 ]},
  {y:1994,p:[
  {n:"Michel Preud'homme",pos:["GK"],r:84},{n:"Filip De Wilde",pos:["GK"],r:76},{n:"Danny Boffin",pos:["GK"],r:70},
  {n:"Eric Van Meir",pos:["CB","RB"],r:73},{n:"Georges Grün",pos:["CB"],r:78},
  {n:"Philippe Albert",pos:["CB"],r:82},{n:"Michel De Wolf",pos:["CB"],r:74},
  {n:"Vital Borkelmans",pos:["RB","CB"],r:72},{n:"Stéphane van der Heyden",pos:["LB","CB"],r:71},
  {n:"Dirk Medved",pos:["CDM","CM"],r:71},{n:"Lorenzo Staelens",pos:["CDM","CM"],r:76},
  {n:"Franky Van der Elst",pos:["CM","CDM"],r:74},{n:"Rudi Smidts",pos:["CM"],r:70},
  {n:"Marc Emmers",pos:["CM","CDM"],r:70},{n:"Pascal Renier",pos:["CM","LW"],r:70},
  {n:"Enzo Scifo",pos:["CAM","CM"],r:82},{n:"Marc Degryse",pos:["LW","RW"],r:78},
  {n:"Marc Wilmots",pos:["CM","ST"],r:79},{n:"Josip Weber",pos:["ST"],r:74},
  {n:"Luc Nilis",pos:["ST"],r:80},{n:"Alexandre Czerniatynski",pos:["ST","LW"],r:72},
  {n:"Franky Van der Elst",pos:["CM","CDM"],r:74}
 ]},
  {y:1998,p:[
  {n:"Filip De Wilde",pos:["GK"],r:78},{n:"Dany Verlinden",pos:["GK"],r:75},{n:"Danny Boffin",pos:["GK"],r:70},
  {n:"Eric Van Meir",pos:["CB","RB"],r:72},{n:"Philippe Albert",pos:["CB"],r:79},
  {n:"Vital Borkelmans",pos:["RB","CB"],r:72},{n:"Nico Van Kerckhoven",pos:["CB","LB"],r:72},
  {n:"Bertrand Crasson",pos:["LB","LWB"],r:72},{n:"Éric Deflandre",pos:["LB","CB"],r:74},
  {n:"Lorenzo Staelens",pos:["CDM","CM"],r:75},{n:"Franky Van der Elst",pos:["CM","CDM"],r:73},
  {n:"Gordan Vidović",pos:["CM","CDM"],r:71},{n:"Glen De Boeck",pos:["CM","CDM"],r:71},
  {n:"Philippe Clement",pos:["CM"],r:71},{n:"Philippe Vande Walle",pos:["CM","LW"],r:70},
  {n:"Mike Verstraeten",pos:["LW","CM"],r:70},{n:"Gert Verheyen",pos:["RW","LW"],r:74},
  {n:"Marc Wilmots",pos:["CM","ST"],r:80},{n:"Luís Oliveira",pos:["ST","LW"],r:74},
  {n:"Mbo Mpenza",pos:["ST","LW"],r:74},{n:"Émile Mpenza",pos:["LW","ST"],r:74},
  {n:"Luc Nilis",pos:["ST"],r:80},{n:"Enzo Scifo",pos:["CAM","CM"],r:79}
 ]},
  {y:2002,p:[
  {n:"Geert De Vlieger",pos:["GK"],r:76},{n:"Frédéric Herpoel",pos:["GK"],r:73},{n:"Gaëtan Englebert",pos:["GK"],r:70},
  {n:"Éric Deflandre",pos:["RB","CB"],r:74},{n:"Daniel Van Buyten",pos:["CB"],r:79},
  {n:"Peter Van der Heyden",pos:["CB"],r:73},{n:"Nico Van Kerckhoven",pos:["CB","LB"],r:71},
  {n:"Glen De Boeck",pos:["LB","CB"],r:71},{n:"Bernd Thijs",pos:["LB"],r:71},
  {n:"Timmy Simons",pos:["CDM","CM"],r:74},{n:"Yves Vanderhaeghe",pos:["CM","CDM"],r:72},
  {n:"Marc Wilmots",pos:["CM","ST"],r:79},{n:"Johan Walem",pos:["CM","CAM"],r:73},
  {n:"Sven Vermant",pos:["CM","CDM"],r:71},{n:"Jacky Peeters",pos:["CM"],r:70},
  {n:"Gert Verheyen",pos:["RW","LW"],r:73},{n:"Bart Goor",pos:["CM","LW"],r:72},
  {n:"Branko Strupar",pos:["ST","LW"],r:73},{n:"Danny Boffin",pos:["GK"],r:70},
  {n:"Franky Vandendriessche",pos:["LW","CM"],r:70},{n:"Wesley Sonck",pos:["ST"],r:73},
  {n:"Eric Van Meir",pos:["CB","RB"],r:70},{n:"Mbo Mpenza",pos:["ST","LW"],r:73}
 ]},
  {y:1982,p:[
  {n:"Jean-Marie Pfaff",pos:["GK"],r:85},{n:"Jacky Munaron",pos:["GK"],r:73},{n:"Jos Daerden",pos:["GK"],r:70},
  {n:"Eric Gerets",pos:["RB","CB"],r:80},{n:"Walter Meeuws",pos:["CB"],r:74},
  {n:"Luc Millecamps",pos:["CB"],r:72},{n:"Michel Renquin",pos:["LB","CB"],r:73},
  {n:"Marc Millecamps",pos:["LB","LWB"],r:70},{n:"Marc Baecke",pos:["RB","CM"],r:70},
  {n:"Wilfried Van Moer",pos:["CDM","CM"],r:77},{n:"René Verheyen",pos:["CM","CDM"],r:72},
  {n:"Maurits De Schrijver",pos:["CM","CDM"],r:70},{n:"Theo Custers",pos:["CM"],r:70},
  {n:"Raymond Mommens",pos:["CM","CDM"],r:71},{n:"Guy Vandersmissen",pos:["CM"],r:70},
  {n:"Ludo Coeck",pos:["CM","CAM"],r:76},{n:"François Van Der Elst",pos:["LW","CM"],r:74},
  {n:"Gerard Plessers",pos:["LW","RW"],r:71},{n:"Franky Vercauteren",pos:["LW","CAM"],r:77},
  {n:"Alexandre Czerniatynski",pos:["ST","LW"],r:73},{n:"Erwin Vandenbergh",pos:["ST"],r:77},
  {n:"Jan Ceulemans",pos:["CM","ST"],r:82}
 ]},
  {y:1986,p:[
  {n:"Jean-Marie Pfaff",pos:["GK"],r:83},{n:"Jacky Munaron",pos:["GK"],r:72},{n:"Gilbert Bodart",pos:["GK"],r:74},
  {n:"Eric Gerets",pos:["RB","CB"],r:79},{n:"Georges Grün",pos:["CB"],r:78},
  {n:"Michel De Wolf",pos:["CB"],r:75},{n:"Leo Clijsters",pos:["CB","CDM"],r:74},
  {n:"Michel Renquin",pos:["LB","CB"],r:72},{n:"Stéphane Demol",pos:["LB","CB"],r:72},
  {n:"Hugo Broos",pos:["CDM","CM"],r:71},{n:"René Vandereycken",pos:["CDM","CM"],r:74},
  {n:"Franky Vercauteren",pos:["CM","LW"],r:76},{n:"Leo Van Der Elst",pos:["CM","CDM"],r:72},
  {n:"Raymond Mommens",pos:["CM","CDM"],r:70},{n:"Patrick Vervoort",pos:["LW","CM"],r:70},
  {n:"Philippe Desmet",pos:["CM","LW"],r:70},{n:"Daniel Veyt",pos:["LW","RW"],r:70},
  {n:"Franky Van der Elst",pos:["CM","LW"],r:74},{n:"Erwin Vandenbergh",pos:["ST"],r:75},
  {n:"Nico Claesen",pos:["ST","LW"],r:74},{n:"Jan Ceulemans",pos:["CM","ST"],r:82},
  {n:"Enzo Scifo",pos:["CAM","CM"],r:80}
 ]},
  {y:1990,p:[
  {n:"Michel Preud'homme",pos:["GK"],r:86},{n:"Gilbert Bodart",pos:["GK"],r:75},{n:"Filip De Wilde",pos:["GK"],r:73},
  {n:"Eric Gerets",pos:["RB","CB"],r:78},{n:"Georges Grün",pos:["CB"],r:77},
  {n:"Michel De Wolf",pos:["CB"],r:74},{n:"Leo Clijsters",pos:["CB","CDM"],r:73},
  {n:"Bruno Versavel",pos:["LB","CB"],r:72},{n:"Stéphane Demol",pos:["LB","CB"],r:72},
  {n:"Lorenzo Staelens",pos:["CDM","CM"],r:74},{n:"Franky Van der Elst",pos:["CM","CDM"],r:73},
  {n:"Jan Ceulemans",pos:["CM","ST"],r:81},{n:"Jean-François De Sart",pos:["CM","CDM"],r:71},
  {n:"Marc Emmers",pos:["CM"],r:70},{n:"Patrick Vervoort",pos:["LW","CM"],r:70},
  {n:"Pascal Plovie",pos:["CM","LW"],r:70},{n:"Marc Van Der Linden",pos:["LW","CM"],r:71},
  {n:"Marc Degryse",pos:["LW","ST"],r:77},{n:"Nico Claesen",pos:["ST","LW"],r:74},
  {n:"Marc Wilmots",pos:["CM","ST"],r:76},{n:"Philippe Albert",pos:["CB"],r:79},
  {n:"Enzo Scifo",pos:["CAM","CM"],r:81}
 ]},
  {y:1970,p:[
  {n:"Christian Piot",pos:["GK"],r:76},{n:"Jean-Marie Trappeniers",pos:["GK"],r:72},{n:"Georges Heylens",pos:["GK"],r:70},
  {n:"Erwin Vandendaele",pos:["CB","RB"],r:72},{n:"Jean Thissen",pos:["CB"],r:71},
  {n:"Léon Jeck",pos:["CB"],r:70},{n:"Nicolas Dewalque",pos:["CB","LB"],r:70},
  {n:"Frans Janssens",pos:["LB","CB"],r:70},{n:"Alfons Peeters",pos:["RB"],r:70},
  {n:"Léon Semmeling",pos:["CDM","CM"],r:74},{n:"Wilfried Van Moer",pos:["CM","CDM"],r:77},
  {n:"Jan Verheyen",pos:["CM","CDM"],r:72},{n:"Jacques Beurlet",pos:["CM"],r:70},
  {n:"Maurice Martens",pos:["CM","LW"],r:71},{n:"Odilon Polleunis",pos:["CM","LW"],r:70},
  {n:"Pierre Carteus",pos:["LW","CM"],r:70},{n:"Jean Dockx",pos:["LW","RW"],r:72},
  {n:"Johan Devrindt",pos:["LW","ST"],r:74},{n:"Wilfried Puis",pos:["LW","ST"],r:71},
  {n:"Jacques Duquesne",pos:["ST","LW"],r:72},{n:"Raoul Lambert",pos:["ST"],r:75},
  {n:"Paul Van Himst",pos:["ST","CAM"],r:83}
 ]}
 ],
 "Colombia":[
  ,
  {y:2018,p:[
  {n:"David Ospina",pos:["GK"],r:80},
  {n:"Camilo Vargas",pos:["GK"],r:72},
  {n:"Jose Fernando Cuadrado",pos:["GK"],r:69},
  {n:"Santiago Arias",pos:["RB","RWB"],r:76},
  {n:"Davinson Sanchez",pos:["CB"],r:81},
  {n:"Cristian Zapata",pos:["CB"],r:76},
  {n:"Yerry Mina",pos:["CB"],r:78},
  {n:"Oscar Murillo",pos:["CB"],r:72},
  {n:"Farid Diaz",pos:["LB","CB"],r:70},
  {n:"Johan Mojica",pos:["LB","LWB"],r:74},
  {n:"Wilmar Barrios",pos:["CDM","CM"],r:77},
  {n:"Carlos Sanchez",pos:["CDM","CM"],r:76},
  {n:"Abel Aguilar",pos:["CM","CDM"],r:72},
  {n:"Jefferson Lerma",pos:["CDM","CM"],r:76},
  {n:"Mateus Uribe",pos:["CM","CDM"],r:76},
  {n:"James Rodriguez",pos:["CAM","CM","RW"],r:87},
  {n:"Juan Cuadrado",pos:["RW","LW","RB"],r:82},
  {n:"Juan Fernando Quintero",pos:["CAM","CM"],r:78},
  {n:"Jose Izquierdo",pos:["LW","ST"],r:74},
  {n:"Carlos Bacca",pos:["ST"],r:78},
  {n:"Radamel Falcao",pos:["ST"],r:83},
  {n:"Luis Muriel",pos:["ST","LW"],r:77},
  {n:"Miguel Borja",pos:["ST"],r:73}
 ]},
  {y:2026,p:[
  {n:"David Ospina",pos:["GK"],r:78},{n:"Camilo Vargas",pos:["GK"],r:76},{n:"Alvaro Montero",pos:["GK"],r:74},
  {n:"Daniel Muñoz",pos:["RB","RWB"],r:80},{n:"Santiago Arias",pos:["RB","CB"],r:73},
  {n:"Davinson Sanchez",pos:["CB"],r:82},{n:"Yerry Mina",pos:["CB"],r:78},
  {n:"Jhon Lucumi",pos:["CB"],r:79},{n:"Willer Ditta",pos:["CB"],r:74},
  {n:"Johan Mojica",pos:["LB","LWB"],r:77},{n:"Deiver Machado",pos:["LB","LWB"],r:74},
  {n:"Jefferson Lerma",pos:["CDM","CM"],r:81},{n:"Richard Rios",pos:["CDM","CM"],r:78},
  {n:"Kevin Castaño",pos:["CDM","CM"],r:74},{n:"Gustavo Puerta",pos:["CM","CDM"],r:73},
  {n:"James Rodriguez",pos:["CAM","CM","RW"],r:85},{n:"Juan Fernando Quintero",pos:["CAM","CM"],r:79},
  {n:"Jorge Carrascal",pos:["CAM","LW"],r:75},{n:"Jaminton Campaz",pos:["LW","CAM"],r:73},
  {n:"Jhon Arias",pos:["RW","LW"],r:78},{n:"Andres Gomez",pos:["LW","RW"],r:72},
  {n:"Luis Diaz",pos:["LW","ST"],r:88},{n:"Cucho Hernandez",pos:["ST","LW"],r:79},
  {n:"Jhon Cordoba",pos:["ST"],r:77},{n:"Luis Suarez",pos:["ST","RW"],r:74}
 ]},
  {y:2014,p:[
  {n:"David Ospina",pos:["GK"],r:80},{n:"Camilo Vargas",pos:["GK"],r:72},{n:"Faryd Mondragón",pos:["GK"],r:70},
  {n:"Santiago Arias",pos:["RB","RWB"],r:74},{n:"Mario Yepes",pos:["CB"],r:76},
  {n:"Carlos Valdés",pos:["CB"],r:74},{n:"Cristián Zapata",pos:["CB"],r:76},
  {n:"Éder Álvarez Balanta",pos:["CB"],r:73},{n:"Pablo Armero",pos:["LB","LWB"],r:74},
  {n:"Juan Camilo Zúñiga",pos:["RB","CM"],r:74},{n:"Carlos Sánchez",pos:["CDM","CM"],r:76},
  {n:"Abel Aguilar",pos:["CDM","CM"],r:72},{n:"Alexander Mejía",pos:["CM","CDM"],r:73},
  {n:"Fredy Guarín",pos:["CM","CDM"],r:78},{n:"Carlos Carbonero",pos:["RW","LW"],r:72},
  {n:"Victor Ibarbo",pos:["LW","RW"],r:73},{n:"Juan Cuadrado",pos:["RW","LW"],r:82},
  {n:"Juan Fernando Quintero",pos:["CAM","CM"],r:76},{n:"Jackson Martínez",pos:["ST"],r:79},
  {n:"Teófilo Gutiérrez",pos:["ST","LW"],r:73},{n:"Carlos Bacca",pos:["ST"],r:79},
  {n:"Adrián Ramos",pos:["ST"],r:74},{n:"James Rodríguez",pos:["CAM","CM","RW"],r:87}
 ]},
  {y:1994,p:[
  {n:"Óscar Córdoba",pos:["GK"],r:77},{n:"Faryd Mondragón",pos:["GK"],r:76},{n:"José María Pazo",pos:["GK"],r:71},
  {n:"Luis Carlos Perea",pos:["CB"],r:77},{n:"Andrés Escobar",pos:["CB"],r:79},
  {n:"Gabriel Gómez",pos:["CB","CDM"],r:73},{n:"Alexis Mendoza",pos:["CB","LB"],r:72},
  {n:"Wilson Pérez",pos:["RB","CB"],r:71},{n:"Néstor Ortiz",pos:["LB","CB"],r:70},
  {n:"Leonel Álvarez",pos:["CDM","CM"],r:76},{n:"Mauricio Serna",pos:["CM","CDM"],r:74},
  {n:"Freddy Rincón",pos:["CM","CAM"],r:83},{n:"John Harold Lozano",pos:["LW","CM"],r:72},
  {n:"Hermán Gaviria",pos:["CM","LW"],r:70},{n:"Luis Fernando Herrera",pos:["LW","CM"],r:71},
  {n:"Óscar Cortés",pos:["LW","RW"],r:71},{n:"Iván Valenciano",pos:["LW","ST"],r:73},
  {n:"Antony de Ávila",pos:["LW","ST"],r:74},{n:"Adolfo Valencia",pos:["RW","ST"],r:76},
  {n:"Víctor Aristizábal",pos:["ST"],r:75},{n:"Faustino Asprilla",pos:["ST","LW"],r:83},
  {n:"Carlos Valderrama",pos:["CAM","CM"],r:86}
 ]},
  {y:1998,p:[
  {n:"Óscar Córdoba",pos:["GK"],r:78},{n:"Faryd Mondragón",pos:["GK"],r:77},{n:"Miguel Calero",pos:["GK"],r:74},
  {n:"Wílmer Cabrera",pos:["RB","CB"],r:73},{n:"Iván Córdoba",pos:["CB"],r:78},
  {n:"Jorge Bermúdez",pos:["CB"],r:76},{n:"John Wilmar Pérez",pos:["CB","LB"],r:72},
  {n:"Andrés Estrada",pos:["LB","CB"],r:71},{n:"Ever Palacios",pos:["RB","CM"],r:70},
  {n:"Mauricio Serna",pos:["CDM","CM"],r:75},{n:"Carlos Valderrama",pos:["CAM","CM"],r:83},
  {n:"Freddy Rincón",pos:["CM","CAM"],r:81},{n:"John Harold Lozano",pos:["LW","CM"],r:72},
  {n:"Jorge Bolaño",pos:["CM","CDM"],r:70},{n:"José Santa",pos:["CM","CDM"],r:70},
  {n:"Luis Antonio Moreno",pos:["LW","CM"],r:71},{n:"Léider Preciado",pos:["LW","ST"],r:72},
  {n:"Adolfo Valencia",pos:["RW","ST"],r:74},{n:"Hámilton Ricard",pos:["ST","LW"],r:74},
  {n:"Víctor Aristizábal",pos:["ST"],r:74},{n:"Antony de Ávila",pos:["LW","ST"],r:73},
  {n:"Faustino Asprilla",pos:["ST","LW"],r:80}
 ]},
  {y:1990,p:[
  {n:"René Higuita",pos:["GK"],r:80},{n:"Carlos Hoyos",pos:["GK"],r:71},{n:"Carlos Estrada",pos:["GK"],r:70},
  {n:"Alexis Mendoza",pos:["RB","CB"],r:72},{n:"Andrés Escobar",pos:["CB"],r:80},
  {n:"Luis Carlos Perea",pos:["CB"],r:77},{n:"Gildardo Gómez",pos:["CB","LB"],r:71},
  {n:"Wílmer Cabrera",pos:["LB","CB"],r:72},{n:"Geovanis Cassiani",pos:["LB"],r:70},
  {n:"Leonel Álvarez",pos:["CDM","CM"],r:76},{n:"Gabriel Gómez",pos:["CM","CDM"],r:73},
  {n:"Bernardo Redín",pos:["CM","CDM"],r:71},{n:"Eduardo Niño",pos:["CM"],r:70},
  {n:"León Villa",pos:["CM","LW"],r:71},{n:"Luis Fajardo",pos:["LW","CM"],r:70},
  {n:"Miguel Guerrero",pos:["LW","CM"],r:70},{n:"Luis Fernando Herrera",pos:["LW","CM"],r:71},
  {n:"Rubén Darío Hernández",pos:["LW","ST"],r:71},{n:"Carlos Valderrama",pos:["CAM","CM"],r:84},
  {n:"Arnoldo Iguarán",pos:["ST"],r:74},{n:"José Ricardo Pérez",pos:["ST","LW"],r:70},
  {n:"Freddy Rincón",pos:["CM","CAM"],r:80}
 ]}
 ],
 "Ghana":[,
  {y:2022,p:[
  {n:"Lawrence Ati-Zigi",pos:["GK"],r:76},
  {n:"Ibrahim Danlad",pos:["GK"],r:71},
  {n:"Abdul Manaf Nurudeen",pos:["GK"],r:72},
  {n:"Tariq Lamptey",pos:["RB","RWB"],r:77},
  {n:"Alidu Seidu",pos:["RB","CB"],r:74},
  {n:"Alexander Djiku",pos:["CB"],r:77},
  {n:"Daniel Amartey",pos:["CB"],r:76},
  {n:"Mohammed Salisu",pos:["CB"],r:78},
  {n:"Denis Odoi",pos:["CB","RB"],r:73},
  {n:"Joseph Aidoo",pos:["CB"],r:75},
  {n:"Gideon Mensah",pos:["LB","LWB"],r:74},
  {n:"Baba Rahman",pos:["LB","LWB"],r:73},
  {n:"Thomas Partey",pos:["CDM","CM"],r:85},
  {n:"Salis Abdul Samed",pos:["CDM","CM"],r:75},
  {n:"Elisha Owusu",pos:["CDM","CM"],r:73},
  {n:"Daniel-Kofi Kyereh",pos:["CAM","CM"],r:74},
  {n:"Kamal Sowah",pos:["RW","CAM"],r:72},
  {n:"Mohammed Kudus",pos:["CAM","LW","RW"],r:81},
  {n:"Osman Bukari",pos:["LW","RW"],r:73},
  {n:"Kamaldeen Sulemana",pos:["LW","ST"],r:77},
  {n:"Iñaki Williams",pos:["ST","LW"],r:78},
  {n:"Abdul Fatawu Issahaku",pos:["LW","RW"],r:74},
  {n:"Andre Ayew",pos:["LW","CAM","ST"],r:79},
  {n:"Jordan Ayew",pos:["ST","LW"],r:76},
  {n:"Antoine Semenyo",pos:["ST","LW"],r:74},
  {n:"Daniel Afriyie",pos:["LW","RW"],r:70}
 ]},
  {y:2026,p:[
  {n:"Lawrence Ati-Zigi",pos:["GK"],r:77},{n:"Joseph Anang",pos:["GK"],r:72},{n:"Benjamin Asare",pos:["GK"],r:70},
  {n:"Jonas Adjetey",pos:["RB","CB"],r:73},{n:"Alidu Seidu",pos:["RB","CB"],r:76},
  {n:"Abdul Mumin",pos:["CB"],r:74},{n:"Jerome Opoku",pos:["CB"],r:74},
  {n:"Derrick Luckassen",pos:["CB"],r:73},{n:"Abdul Rahman Baba",pos:["LB","LWB"],r:75},
  {n:"Gideon Mensah",pos:["LB","LWB"],r:76},{n:"Thomas Partey",pos:["CDM","CM"],r:84},
  {n:"Elisha Owusu",pos:["CDM","CM"],r:74},{n:"Caleb Yirenkyi",pos:["CM","CDM"],r:71},
  {n:"Marvin Senaya",pos:["CM","LW"],r:71},{n:"Prince Kwabena Adu",pos:["CM"],r:70},
  {n:"Mohammed Kudus",pos:["CAM","LW","RW"],r:84},{n:"Abdul Fatawu",pos:["LW","RW"],r:78},
  {n:"Kamaldeen Sulemana",pos:["LW","ST"],r:79},{n:"Ernest Nuamah",pos:["LW","RW"],r:75},
  {n:"Osman Bukari",pos:["LW","RW"],r:74},{n:"Christopher Bonsu Baah",pos:["RW","LW"],r:73},
  {n:"Augustine Boakye",pos:["LW","RW"],r:72},{n:"Iñaki Williams",pos:["ST","LW"],r:79},
  {n:"Antoine Semenyo",pos:["ST","LW"],r:77},{n:"Jordan Ayew",pos:["ST","LW"],r:75},
  {n:"Brandon Thomas-Asante",pos:["ST"],r:73}
 ]},
  {y:2006,p:[
  {n:"Richard Kingson",pos:["GK"],r:76},{n:"George Owu",pos:["GK"],r:72},{n:"Sammy Adjei",pos:["GK"],r:71},
  {n:"John Paintsil",pos:["RB","RWB"],r:75},{n:"John Mensah",pos:["CB"],r:78},
  {n:"Samuel Kuffour",pos:["CB"],r:78},{n:"Illiasu Shilla",pos:["CB"],r:72},
  {n:"Eric Addo",pos:["LB","CDM"],r:73},{n:"Hans Sarpei",pos:["LB","LWB"],r:74},
  {n:"Otto Addo",pos:["CM","CDM"],r:73},{n:"Derek Boateng",pos:["CM","CDM"],r:74},
  {n:"Habib Mohamed",pos:["CDM","CM"],r:71},{n:"Issah Ahmed",pos:["CM"],r:70},
  {n:"Emmanuel Pappoe",pos:["CM","CDM"],r:70},{n:"Stephen Appiah",pos:["CM","CAM"],r:80},
  {n:"Michael Essien",pos:["CM","CDM"],r:87},{n:"Sulley Muntari",pos:["CM","LW"],r:80},
  {n:"Haminu Draman",pos:["LW","ST"],r:72},{n:"Alex Tachie-Mensah",pos:["LW","RW"],r:71},
  {n:"Razak Pimpong",pos:["LW","RW"],r:71},{n:"Daniel Quaye",pos:["ST","LW"],r:71},
  {n:"Matthew Amoah",pos:["ST","LW"],r:74},{n:"Asamoah Gyan",pos:["ST"],r:79}
 ]},
  {y:2010,p:[
  {n:"Richard Kingson",pos:["GK"],r:75},{n:"Daniel Agyei",pos:["GK"],r:70},{n:"Stephen Ahorlu",pos:["GK"],r:70},
  {n:"John Paintsil",pos:["RB","RWB"],r:74},{n:"John Mensah",pos:["CB"],r:77},
  {n:"Jonathan Mensah",pos:["CB"],r:73},{n:"Isaac Vorsah",pos:["CB"],r:72},
  {n:"Lee Addy",pos:["LB","CB"],r:71},{n:"Hans Sarpei",pos:["LB","LWB"],r:73},
  {n:"Samuel Inkoom",pos:["RB"],r:73},{n:"Anthony Annan",pos:["CDM","CM"],r:74},
  {n:"Derek Boateng",pos:["CM","CDM"],r:73},{n:"Kwadwo Asamoah",pos:["CM","LW"],r:80},
  {n:"Kevin-Prince Boateng",pos:["CM","CAM"],r:79},{n:"Ibrahim Ayew",pos:["CM","LW"],r:71},
  {n:"Stephen Appiah",pos:["CM","CAM"],r:78},{n:"Sulley Muntari",pos:["CM","LW"],r:79},
  {n:"André Ayew",pos:["LW","CAM"],r:77},{n:"Quincy Owusu-Abeyie",pos:["LW","RW"],r:72},
  {n:"Prince Tagoe",pos:["LW","ST"],r:71},{n:"Dominic Adiyiah",pos:["ST"],r:70},
  {n:"Matthew Amoah",pos:["ST","LW"],r:72},{n:"Asamoah Gyan",pos:["ST"],r:82}
 ]},
  {y:2014,p:[
  {n:"Fatau Dauda",pos:["GK"],r:74},{n:"Adam Larsen Kwarasey",pos:["GK"],r:74},{n:"Chigozie Agbim",pos:["GK"],r:70},
  {n:"Harrison Afful",pos:["RB","RWB"],r:75},{n:"John Boye",pos:["CB"],r:74},
  {n:"Jonathan Mensah",pos:["CB"],r:74},{n:"Daniel Opare",pos:["RB","CB"],r:72},
  {n:"Rashid Sumaila",pos:["CB"],r:71},{n:"Samuel Inkoom",pos:["LB","RB"],r:72},
  {n:"Stephen Adams",pos:["CDM","CM"],r:70},{n:"Afriyie Acquah",pos:["CDM","CM"],r:73},
  {n:"Mohammed Rabiu",pos:["CDM","CM"],r:72},{n:"Emmanuel Agyemang-Badu",pos:["CM","CDM"],r:74},
  {n:"Mubarak Wakaso",pos:["CM","CDM"],r:73},{n:"Christian Atsu",pos:["LW","RW"],r:76},
  {n:"Albert Adomah",pos:["RW","LW"],r:73},{n:"Abdul Majeed Waris",pos:["LW","ST"],r:73},
  {n:"Jordan Ayew",pos:["LW","ST"],r:73},{n:"Kevin-Prince Boateng",pos:["CM","CAM"],r:77},
  {n:"Asamoah Gyan",pos:["ST"],r:81},{n:"André Ayew",pos:["LW","CAM","ST"],r:80},
  {n:"Michael Essien",pos:["CM","CDM"],r:81},{n:"Kwadwo Asamoah",pos:["CM","LW"],r:82},
  {n:"Sulley Muntari",pos:["CM","LW"],r:77}
 ]}
 ],
 "Czech Republic":[,
  {y:2026,p:[
  {n:"Matej Kovar",pos:["GK"],r:80},{n:"Jindrich Stanek",pos:["GK"],r:78},{n:"Hugo Sochůrek",pos:["GK"],r:70},
  {n:"Vladimir Coufal",pos:["RB","RWB"],r:78},{n:"David Doudera",pos:["RB","CB"],r:74},
  {n:"Robin Hranaс",pos:["CB"],r:78},{n:"David Zima",pos:["CB"],r:74},
  {n:"Ladislav Krejci",pos:["CB","LB"],r:76},{n:"David Jurasek",pos:["LB","LWB"],r:76},
  {n:"Tomas Holes",pos:["CDM","CM"],r:75},{n:"Tomas Soucek",pos:["CM","CDM"],r:84},
  {n:"Michal Sadílek",pos:["CM","CDM"],r:73},{n:"Lukas Provod",pos:["CM","LW"],r:74},
  {n:"Vladimír Darida",pos:["CM","CAM"],r:72},{n:"Alexandr Sojka",pos:["RB"],r:70},
  {n:"Pavel Šulc",pos:["CAM","RW"],r:75},{n:"Lukas Červ",pos:["CM","LW"],r:72},
  {n:"Jaroslav Zeleny",pos:["CM"],r:70},{n:"Adam Hlozek",pos:["LW","ST","RW"],r:78},
  {n:"Denis Visinský",pos:["LW","RW"],r:71},{n:"Lukáš Hornícek",pos:["CM","LW"],r:70},
  {n:"Mojmir Chytil",pos:["ST","LW"],r:75},{n:"Jan Kuchta",pos:["ST"],r:74},
  {n:"Tomas Chory",pos:["ST"],r:73},{n:"Patrik Schick",pos:["ST","LW"],r:82},
  {n:"Stepan Chaloupek",pos:["CDM","CM"],r:70}
 ]},
  {y:2006,p:[
  {n:"Petr Čech",pos:["GK"],r:88},{n:"Jaromír Blažek",pos:["GK"],r:76},{n:"Antonín Kinský",pos:["GK"],r:73},
  {n:"Zdeněk Grygera",pos:["RB","CB"],r:75},{n:"Tomáš Ujfaluši",pos:["CB"],r:79},
  {n:"Martin Jiránek",pos:["CB"],r:75},{n:"David Rozehnal",pos:["CB","LB"],r:75},
  {n:"Marek Jankulovski",pos:["LB","LWB"],r:77},{n:"Jan Polák",pos:["RB","CM"],r:73},
  {n:"Tomáš Galásek",pos:["CDM","CM"],r:75},{n:"Radoslav Kováč",pos:["CM","CDM"],r:74},
  {n:"David Jarolím",pos:["CM","CDM"],r:73},{n:"Karel Poborský",pos:["RW","CM"],r:75},
  {n:"Tomáš Rosický",pos:["CM","CAM"],r:84},{n:"Jaroslav Plašil",pos:["CM","CAM"],r:77},
  {n:"Pavel Nedvěd",pos:["LW","CAM","CM"],r:87},{n:"Jiří Štajner",pos:["LW","ST"],r:72},
  {n:"Libor Sionko",pos:["RW","LW"],r:74},{n:"Marek Heinz",pos:["RW","LW"],r:72},
  {n:"Pavel Mareš",pos:["LW","CM"],r:71},{n:"Vratislav Lokvenc",pos:["ST"],r:70},
  {n:"Milan Baroš",pos:["ST","LW"],r:80},{n:"Jan Koller",pos:["ST"],r:81}
 ]}
 ],
 "Ivory Coast":[,
  {y:2026,p:[
  {n:"Yahia Fofana",pos:["GK"],r:80},{n:"Alban Lafont",pos:["GK"],r:79},{n:"Parfait Guiagon",pos:["GK"],r:71},
  {n:"Wilfried Singo",pos:["RB","RWB"],r:81},{n:"Ghislain Konan",pos:["LB","LWB"],r:77},
  {n:"Evan Ndicka",pos:["CB"],r:82},{n:"Emmanuel Agbadou",pos:["CB"],r:79},
  {n:"Odilon Kossounou",pos:["CB"],r:79},{n:"Ousmane Diomande",pos:["CB"],r:78},
  {n:"Mohamed Kone",pos:["CB","LB"],r:74},{n:"Bazoumana Toure",pos:["LB"],r:72},
  {n:"Ibrahim Sangare",pos:["CDM","CM"],r:83},{n:"Jean Michaël Seri",pos:["CM","CDM"],r:79},
  {n:"Seko Fofana",pos:["CM","CDM"],r:82},{n:"Franck Kessie",pos:["CM","CDM"],r:83},
  {n:"Oumar Diakite",pos:["CM"],r:72},{n:"Yan Diomande",pos:["CM","CDM"],r:74},
  {n:"Nicolas Pepe",pos:["RW","LW"],r:80},{n:"Simon Adingra",pos:["LW","RW"],r:79},
  {n:"Amad Diallo",pos:["RW","LW"],r:81},{n:"Guéla Doue",pos:["LW","RW"],r:74},
  {n:"Christopher Operi",pos:["CDM","CM"],r:72},{n:"Ange-Yoan Bonny",pos:["ST","LW"],r:75},
  {n:"Elye Wahi",pos:["ST","LW"],r:78},{n:"Evann Guessand",pos:["ST","LW"],r:74},
  {n:"Christ Inao Oulai",pos:["ST"],r:70}
 ]},
  {y:2006,p:[
  {n:"Boubacar Barry",pos:["GK"],r:74},{n:"Gérard Gnanhouan",pos:["GK"],r:71},{n:"Jean-Jacques Tizié",pos:["GK"],r:70},
  {n:"Guy Demel",pos:["RB","RWB"],r:75},{n:"Kolo Touré",pos:["CB"],r:83},
  {n:"Cyril Domoraud",pos:["CB"],r:74},{n:"Emmanuel Eboué",pos:["RB","RWB"],r:77},
  {n:"Arthur Boka",pos:["LB","LWB"],r:76},{n:"Marco Zoro",pos:["LB","CB"],r:72},
  {n:"Abdoulaye Méïté",pos:["CB"],r:73},{n:"Didier Zokora",pos:["CDM","CM"],r:79},
  {n:"Emerse Faé",pos:["CM","CDM"],r:73},{n:"Gilles Yapi Yapo",pos:["CM","CDM"],r:73},
  {n:"Blaise Kouassi",pos:["CM"],r:69},{n:"Jean-Jacques Gosso",pos:["CM","CAM"],r:72},
  {n:"Romaric",pos:["CM","CDM"],r:74},{n:"Abdul Kader Keïta",pos:["LW","CAM"],r:76},
  {n:"Kanga Akalé",pos:["LW","RW"],r:72},{n:"Bonaventure Kalou",pos:["RW","LW"],r:73},
  {n:"Arouna Koné",pos:["LW","ST"],r:77},{n:"Bakari Koné",pos:["LW","ST"],r:72},
  {n:"Aruna Dindane",pos:["ST","LW"],r:74},{n:"Didier Drogba",pos:["ST"],r:88},
  {n:"Yaya Touré",pos:["CM","CDM"],r:82}
 ]},
  {y:2010,p:[
  {n:"Boubacar Barry",pos:["GK"],r:74},{n:"Aristide Zogbo",pos:["GK"],r:70},{n:"Daniel Yeboah",pos:["GK"],r:69},
  {n:"Guy Demel",pos:["RB","RWB"],r:75},{n:"Kolo Touré",pos:["CB"],r:81},
  {n:"Emmanuel Koné",pos:["CB"],r:71},{n:"Sol Bamba",pos:["CB"],r:74},
  {n:"Siaka Tiéné",pos:["LB","CB"],r:72},{n:"Arthur Boka",pos:["LB","LWB"],r:74},
  {n:"Benjamin Angoua",pos:["CB"],r:71},{n:"Cheick Tioté",pos:["CDM","CM"],r:79},
  {n:"Didier Zokora",pos:["CDM","CM"],r:77},{n:"Jean-Jacques Gosso",pos:["CM","CAM"],r:72},
  {n:"Romaric",pos:["CM","CDM"],r:73},{n:"Emmanuel Eboué",pos:["RB","RWB"],r:75},
  {n:"Steve Gohouri",pos:["CB"],r:70},{n:"Gervinho",pos:["LW","ST"],r:78},
  {n:"Salomon Kalou",pos:["ST","LW"],r:78},{n:"Abdul Kader Keïta",pos:["LW","CAM"],r:74},
  {n:"Seydou Doumbia",pos:["ST","LW"],r:77},{n:"Aruna Dindane",pos:["ST","LW"],r:72},
  {n:"Pierre Webó",pos:["LW","ST"],r:73},{n:"Didier Drogba",pos:["ST"],r:90},
  {n:"Yaya Touré",pos:["CM","CDM"],r:87}
 ]},
  {y:2014,p:[
  {n:"Sylvain Gbohouo",pos:["GK"],r:74},{n:"Sayouba Mandé",pos:["GK"],r:71},{n:"Boubacar Barry",pos:["GK"],r:72},
  {n:"Serge Aurier",pos:["RB","RWB"],r:79},{n:"Kolo Touré",pos:["CB"],r:78},
  {n:"Arthur Boka",pos:["LB","LWB"],r:73},{n:"Constant Djakpa",pos:["LB","CB"],r:71},
  {n:"Sol Bamba",pos:["CB"],r:73},{n:"Ismaël Diomandé",pos:["CB"],r:72},
  {n:"Didier Zokora",pos:["CDM","CM"],r:75},{n:"Cheick Tioté",pos:["CDM","CM"],r:80},
  {n:"Serey Dié",pos:["CDM","CM"],r:75},{n:"Jean-Daniel Akpa Akpro",pos:["CM"],r:70},
  {n:"Ousmane Viera",pos:["CM"],r:69},{n:"Max Gradel",pos:["LW","ST"],r:74},
  {n:"Mathis Bolly",pos:["LW","RW"],r:71},{n:"Giovanni Sio",pos:["LW","ST"],r:72},
  {n:"Gervinho",pos:["LW","ST"],r:78},{n:"Salomon Kalou",pos:["ST","LW"],r:77},
  {n:"Didier Ya Konan",pos:["ST","LW"],r:72},{n:"Wilfried Bony",pos:["ST","LW"],r:82},
  {n:"Yaya Touré",pos:["CM","CDM"],r:89},{n:"Didier Drogba",pos:["ST"],r:83}
 ]}
 ],
 "Italy_1934":[{y:1934,p:[{n:"Gianpiero Combi",pos:["GK"],r:88},{n:"Eraldo Monzeglio",pos:["RB"],r:78},{n:"Luigi Allemandi",pos:["LB"],r:78},{n:"Attilio Ferraris",pos:["CM","CDM"],r:79},{n:"Luigi Monti",pos:["CB","CDM"],r:82},{n:"Luigi Bertolini",pos:["CM"],r:77},{n:"Enrique Guaita",pos:["RW","ST"],r:81},{n:"Giuseppe Meazza",pos:["CAM","ST"],r:94},{n:"Angelo Schiavio",pos:["ST"],r:84},{n:"Giovanni Ferrari",pos:["CM","CAM"],r:85},{n:"Raimundo Orsi",pos:["LW","CAM"],r:82},{n:"Carlo Ceresoli",pos:["GK"],r:74},{n:"Virginio Rosetta",pos:["CB","RB"],r:76},{n:"Pietro Arcari",pos:["LB"],r:73},{n:"Mario Pizziolo",pos:["CB"],r:72},{n:"Felice Borel",pos:["ST","LW"],r:79},{n:"Umberto Caligaris",pos:["LB"],r:74},{n:"Gino Colaussi",pos:["LW"],r:77},{n:"Pietro Ferraris",pos:["CM"],r:74},{n:"Amedeo Biavati",pos:["RW"],r:76},{n:"Carlo Raimondo",pos:["CM"],r:71},{n:"Silvio Piola",pos:["ST"],r:83},{n:"Francesco Ferraris",pos:["CDM"],r:71}]}],
 "Italy_1938":[{y:1938,p:[{n:"Aldo Olivieri",pos:["GK"],r:84},{n:"Alfredo Foni",pos:["RB"],r:79},{n:"Pietro Rava",pos:["LB"],r:80},{n:"Ugo Locatelli",pos:["CDM","CM"],r:78},{n:"Michele Andreolo",pos:["CB","CDM"],r:80},{n:"Amadeo Biavati",pos:["RW","CM"],r:78},{n:"Giuseppe Meazza",pos:["CAM","ST"],r:92},{n:"Giovanni Ferrari",pos:["CM","CAM"],r:83},{n:"Silvio Piola",pos:["ST"],r:91},{n:"Gino Colaussi",pos:["LW"],r:82},{n:"Pietro Serantoni",pos:["CB","CDM"],r:75},{n:"Enrico Olivieri",pos:["GK"],r:73},{n:"Luigi Locatelli",pos:["CM"],r:74},{n:"Romeo Menti",pos:["LW","ST"],r:79},{n:"Ezio Loik",pos:["CM"],r:80},{n:"Francesco Bonazza",pos:["ST"],r:76},{n:"Pietro Ferraris",pos:["CM"],r:74},{n:"Carlo Rava",pos:["LB"],r:72},{n:"Aldo Donati",pos:["CM"],r:72},{n:"Dino Fiorini",pos:["CB"],r:71},{n:"Alfredo Foni II",pos:["CB"],r:71},{n:"Camillo Achilli",pos:["RB"],r:70},{n:"Aldo Boffi",pos:["ST"],r:75}]}],
 "Italy_1982":[{y:1982,p:[{n:"Dino Zoff",pos:["GK"],r:93},{n:"Claudio Gentile",pos:["RB","CB"],r:84},{n:"Gaetano Scirea",pos:["CB","CDM"],r:88},{n:"Antonio Cabrini",pos:["LB","LWB"],r:82},{n:"Fulvio Collovati",pos:["CB"],r:80},{n:"Marco Tardelli",pos:["CM","CDM"],r:85},{n:"Bruno Conti",pos:["RW","LW","CM"],r:83},{n:"Paolo Rossi",pos:["ST"],r:92},{n:"Francesco Graziani",pos:["ST","LW"],r:80},{n:"Giancarlo Antognoni",pos:["CAM","CM"],r:85},{n:"Gabriele Oriali",pos:["CM","CDM"],r:78},{n:"Ivano Bordon",pos:["GK"],r:80},{n:"Franco Causio",pos:["RW","CM"],r:79},{n:"Pietro Fanna",pos:["RW"],r:75},{n:"Giuseppe Dossena",pos:["CM"],r:73},{n:"Romeo Benetti",pos:["CDM","CM"],r:76},{n:"Franco Selvaggi",pos:["ST"],r:72},{n:"Roberto Bettega",pos:["ST","RW"],r:82},{n:"Alessandro Altobelli",pos:["ST"],r:80},{n:"Beppe Dossena",pos:["LB","CM"],r:72},{n:"Eraldo Pecci",pos:["CM","CDM"],r:74},{n:"Vito Amendolara",pos:["GK"],r:73},{n:"Mauro Bellugi",pos:["CB"],r:74}]}],
 "West Germany":[
  {y:1954,p:[{n:"Toni Turek",pos:["GK"],r:88},{n:"Fritz Walter",pos:["CM","CAM"],r:94},{n:"Ottmar Walter",pos:["ST","RW"],r:88},{n:"Helmut Rahn",pos:["RW","ST"],r:90},{n:"Max Morlock",pos:["ST","CAM"],r:84},{n:"Hans Schafer",pos:["LW","CM"],r:81},{n:"Werner Liebrich",pos:["CB"],r:79},{n:"Horst Eckel",pos:["CM","RB"],r:80},{n:"Werner Kohlmeyer",pos:["LB"],r:78},{n:"Jupp Posipal",pos:["CB"],r:77},{n:"Karl Mai",pos:["CDM","CM"],r:76},{n:"Alfred Pfaff",pos:["CM","CAM"],r:81},{n:"Fritz Herkenrath",pos:["GK"],r:71},{n:"Friedrich Matysik",pos:["CB"],r:72},{n:"Richard Herrmann",pos:["RW"],r:74},{n:"Adolf Preissler",pos:["ST"],r:77},{n:"Bernhard Klodt",pos:["RW"],r:76},{n:"Georg Stollenwerk",pos:["LB"],r:72},{n:"Hans Bauer",pos:["CM"],r:73},{n:"Herbert Burdenski",pos:["GK"],r:70},{n:"Joseph Posipal",pos:["RB"],r:73},{n:"Herbert Ehrhardt",pos:["CDM"],r:74},{n:"Erich Registrat",pos:["ST"],r:70}]},{y:1982,p:[
  {n:"Harald Schumacher",pos:["GK"],r:84},{n:"Bernd Franke",pos:["GK"],r:76},{n:"Eike Immel",pos:["GK"],r:76},
  {n:"Manfred Kaltz",pos:["RB","RWB"],r:78},{n:"Karlheinz Förster",pos:["CB"],r:81},
  {n:"Bernd Förster",pos:["CB"],r:78},{n:"Uli Stielike",pos:["CDM","CB"],r:81},
  {n:"Hans-Peter Briegel",pos:["LB","LWB"],r:80},{n:"Stephan Engels",pos:["LB","CB"],r:71},
  {n:"Wolfgang Dremmler",pos:["CDM","CM"],r:74},{n:"Hansi Müller",pos:["CM","CDM"],r:76},
  {n:"Felix Magath",pos:["CM","CAM"],r:79},{n:"Holger Hieronymus",pos:["CM"],r:70},
  {n:"Lothar Matthäus",pos:["CM","CDM"],r:82},{n:"Pierre Littbarski",pos:["LW","RW"],r:81},
  {n:"Thomas Allofs",pos:["LW","ST"],r:72},{n:"Uwe Reinders",pos:["LW","ST"],r:72},
  {n:"Wilfried Hannes",pos:["LW","CM"],r:71},{n:"Klaus Fischer",pos:["ST"],r:79},
  {n:"Horst Hrubesch",pos:["ST"],r:79},{n:"Karl-Heinz Rummenigge",pos:["ST","LW"],r:90},
  {n:"Paul Breitner",pos:["CM","LB"],r:83}
 ]},
  {y:1986,p:[
  {n:"Harald Schumacher",pos:["GK"],r:83},{n:"Uli Stein",pos:["GK"],r:76},{n:"Eike Immel",pos:["GK"],r:76},
  {n:"Thomas Berthold",pos:["RB","CB"],r:76},{n:"Karlheinz Förster",pos:["CB"],r:80},
  {n:"Klaus Augenthaler",pos:["CB","CDM"],r:79},{n:"Ditmar Jakobs",pos:["CB"],r:74},
  {n:"Hans-Peter Briegel",pos:["LB","LWB"],r:79},{n:"Norbert Eder",pos:["LB","CB"],r:72},
  {n:"Wolfgang Rolff",pos:["CDM","CM"],r:73},{n:"Felix Magath",pos:["CM","CAM"],r:77},
  {n:"Matthias Herget",pos:["CM","CDM"],r:72},{n:"Olaf Thon",pos:["CM","CDM"],r:76},
  {n:"Karl Allgöwer",pos:["CM","LW"],r:71},{n:"Andreas Brehme",pos:["LB","LWB"],r:82},
  {n:"Pierre Littbarski",pos:["LW","RW"],r:80},{n:"Lothar Matthäus",pos:["CM","CDM"],r:86},
  {n:"Dieter Hoeneß",pos:["ST","LW"],r:72},{n:"Klaus Allofs",pos:["ST","LW"],r:75},
  {n:"Uwe Rahn",pos:["ST"],r:72},{n:"Rudi Völler",pos:["ST","LW"],r:82},
  {n:"Karl-Heinz Rummenigge",pos:["ST","LW"],r:87}
 ]},
  {y:1990,p:[
  {n:"Bodo Illgner",pos:["GK"],r:84},{n:"Raimond Aumann",pos:["GK"],r:77},{n:"Andreas Köpke",pos:["GK"],r:79},
  {n:"Thomas Berthold",pos:["RB","CB"],r:77},{n:"Jürgen Kohler",pos:["CB"],r:84},
  {n:"Klaus Augenthaler",pos:["CB","CDM"],r:76},{n:"Guido Buchwald",pos:["CB","CDM"],r:80},
  {n:"Andreas Brehme",pos:["LB","LWB"],r:84},{n:"Hans Pflügler",pos:["RB","CB"],r:73},
  {n:"Lothar Matthäus",pos:["CM","CDM"],r:90},{n:"Stefan Reuter",pos:["CM","RB"],r:77},
  {n:"Paul Steiner",pos:["CDM","CM"],r:71},{n:"Günter Hermann",pos:["CM"],r:70},
  {n:"Frank Mill",pos:["ST","LW"],r:72},{n:"Olaf Thon",pos:["CM","CDM"],r:77},
  {n:"Andreas Möller",pos:["CM","CAM"],r:78},{n:"Thomas Häßler",pos:["CM","CDM"],r:79},
  {n:"Pierre Littbarski",pos:["LW","RW"],r:79},{n:"Karl-Heinz Riedle",pos:["LW","ST"],r:77},
  {n:"Jürgen Klinsmann",pos:["ST"],r:84},{n:"Rudi Völler",pos:["ST","LW"],r:83},
  {n:"Uwe Bein",pos:["CAM","CM"],r:75}
 ]},
  {y:1970,p:[
  {n:"Sepp Maier",pos:["GK"],r:87},{n:"Manfred Manglitz",pos:["GK"],r:72},{n:"Horst Wolter",pos:["GK"],r:70},
  {n:"Karl-Heinz Schnellinger",pos:["LB","CB"],r:78},{n:"Willi Schulz",pos:["CB"],r:77},
  {n:"Berti Vogts",pos:["RB","CB"],r:81},{n:"Horst-Dieter Höttges",pos:["RB","CB"],r:76},
  {n:"Klaus Fichtel",pos:["CB"],r:74},{n:"Peter Dietrich",pos:["LB","CB"],r:72},
  {n:"Klaus-Dieter Sieloff",pos:["CDM","CM"],r:73},{n:"Bernd Patzke",pos:["CM","CDM"],r:72},
  {n:"Wolfgang Overath",pos:["CM","CAM"],r:83},{n:"Helmut Haller",pos:["CM","CAM"],r:77},
  {n:"Hannes Löhr",pos:["LW","CM"],r:73},{n:"Sigfried Held",pos:["LW","RW"],r:73},
  {n:"Reinhard Libuda",pos:["LW","RW"],r:71},{n:"Jürgen Grabowski",pos:["RW","LW"],r:78},
  {n:"Franz Beckenbauer",pos:["CB","CDM"],r:92},{n:"Max Lorenz",pos:["LW","ST"],r:72},
  {n:"Uwe Seeler",pos:["ST"],r:83},{n:"Gerd Müller",pos:["ST"],r:94},
  {n:"Wolfgang Weber",pos:["CB","CM"],r:73}
 ]},
  {y:1974,p:[
  {n:"Sepp Maier",pos:["GK"],r:88},{n:"Wolfgang Kleff",pos:["GK"],r:77},{n:"Norbert Nigbur",pos:["GK"],r:74},
  {n:"Berti Vogts",pos:["RB","CB"],r:82},{n:"Horst-Dieter Höttges",pos:["RB","CB"],r:74},
  {n:"Hans-Georg Schwarzenbeck",pos:["CB"],r:79},{n:"Bernhard Cullmann",pos:["LB","CB"],r:74},
  {n:"Paul Breitner",pos:["LB","LWB"],r:84},{n:"Dieter Herzog",pos:["LB","CB"],r:70},
  {n:"Helmut Kremers",pos:["CDM","CM"],r:73},{n:"Herbert Wimmer",pos:["CDM","CM"],r:74},
  {n:"Wolfgang Overath",pos:["CM","CAM"],r:82},{n:"Günter Netzer",pos:["CM","CAM"],r:84},
  {n:"Heinz Flohe",pos:["CM","CAM"],r:75},{n:"Rainer Bonhof",pos:["CM","CDM"],r:76},
  {n:"Jupp Kapellmann",pos:["LW","CM"],r:71},{n:"Jürgen Grabowski",pos:["RW","LW"],r:78},
  {n:"Bernd Hölzenbein",pos:["LW","ST"],r:77},{n:"Franz Beckenbauer",pos:["CB","CDM"],r:93},
  {n:"Jupp Heynckes",pos:["ST","LW"],r:78},{n:"Uli Hoeneß",pos:["LW","ST"],r:79},
  {n:"Gerd Müller",pos:["ST"],r:93}
 ]},
  {y:1978,p:[
  {n:"Sepp Maier",pos:["GK"],r:86},{n:"Rudolf Kargus",pos:["GK"],r:76},{n:"Dieter Burdenski",pos:["GK"],r:74},
  {n:"Manfred Kaltz",pos:["RB","RWB"],r:78},{n:"Hans-Georg Schwarzenbeck",pos:["CB"],r:77},
  {n:"Berti Vogts",pos:["RB","CB"],r:80},{n:"Rolf Rüssmann",pos:["CB"],r:73},
  {n:"Bernard Dietz",pos:["LB","CB"],r:74},{n:"Bernhard Cullmann",pos:["LB","CM"],r:73},
  {n:"Rainer Bonhof",pos:["CM","CDM"],r:77},{n:"Heinz Flohe",pos:["CM","CAM"],r:75},
  {n:"Hansi Müller",pos:["CM","CAM"],r:75},{n:"Gerd Zewe",pos:["CM","CDM"],r:71},
  {n:"Harald Konopka",pos:["CM","LW"],r:70},{n:"Ronald Worm",pos:["LW","CM"],r:70},
  {n:"Bernd Hölzenbein",pos:["LW","ST"],r:77},{n:"Erich Beer",pos:["LW","ST"],r:72},
  {n:"Rüdiger Abramczik",pos:["LW","RW"],r:72},{n:"Karl-Heinz Rummenigge",pos:["ST","LW"],r:86},
  {n:"Klaus Fischer",pos:["ST"],r:79},{n:"Dieter Müller",pos:["ST"],r:76},
  {n:"Herbert Zimmermann",pos:["CM","CDM"],r:70}
 ]},
  {y:1966,p:[
  {n:"Hans Tilkowski",pos:["GK"],r:80},{n:"Sepp Maier",pos:["GK"],r:83},{n:"Günter Bernard",pos:["GK"],r:70},
  {n:"Horst-Dieter Höttges",pos:["RB","CB"],r:75},{n:"Karl-Heinz Schnellinger",pos:["LB","CB"],r:78},
  {n:"Willi Schulz",pos:["CB"],r:76},{n:"Klaus-Dieter Sieloff",pos:["CB","CDM"],r:72},
  {n:"Friedel Lutz",pos:["CB","RB"],r:71},{n:"Wolfgang Paul",pos:["LB","CB"],r:70},
  {n:"Bernd Patzke",pos:["CDM","CM"],r:72},{n:"Heinz Hornig",pos:["CM","CDM"],r:71},
  {n:"Werner Krämer",pos:["CM","CDM"],r:71},{n:"Albert Brülls",pos:["CM","LW"],r:72},
  {n:"Wolfgang Overath",pos:["CM","CAM"],r:82},{n:"Helmut Haller",pos:["CM","CAM"],r:76},
  {n:"Franz Beckenbauer",pos:["CM","CDM"],r:88},{n:"Jürgen Grabowski",pos:["RW","LW"],r:76},
  {n:"Sigfried Held",pos:["LW","RW"],r:72},{n:"Max Lorenz",pos:["LW","ST"],r:71},
  {n:"Lothar Emmerich",pos:["LW","ST"],r:75},{n:"Uwe Seeler",pos:["ST"],r:84},
  {n:"Wolfgang Weber",pos:["CB","CM"],r:72}
 ]}
 ],
 "Hungary_1954":[{y:1954,p:[{n:"Gyula Grosics",pos:["GK"],r:88},{n:"Jeno Buzanszky",pos:["RB"],r:79},{n:"Mihaly Lantos",pos:["LB"],r:80},{n:"Jozsef Zakarias",pos:["CDM","CM"],r:80},{n:"Gyula Lorant",pos:["CB"],r:82},{n:"Jozsef Bozsik",pos:["CM","CAM"],r:91},{n:"Zoltan Czibor",pos:["LW","RW"],r:88},{n:"Sandor Kocsis",pos:["ST","CAM"],r:94},{n:"Nandor Hidegkuti",pos:["ST","CAM"],r:92},{n:"Ferenc Puskas",pos:["LW","ST","CAM"],r:98},{n:"Mihaly Toth",pos:["LW","CM"],r:79},{n:"Karoly Sandor",pos:["RW","CM"],r:83},{n:"Lajos Tichy",pos:["ST"],r:82},{n:"Imre Budai",pos:["RW"],r:79},{n:"Lajos Csordas",pos:["GK"],r:73},{n:"Imre Kovacs",pos:["GK"],r:72},{n:"Erno Bezsenyi",pos:["RB"],r:74},{n:"Peter Palotai",pos:["CDM"],r:71},{n:"Gyorgy Szepesi",pos:["LB"],r:72},{n:"Peter Kovacs",pos:["CM"],r:71},{n:"Janos Dudas",pos:["CB"],r:72},{n:"Bela Lantos",pos:["LB"],r:71},{n:"Gyula Biro",pos:["ST"],r:75}]}],
 "Brazil_1958":[{y:1958,p:[{n:"Gilmar",pos:["GK"],r:88},{n:"Djalma Santos",pos:["RB"],r:85},{n:"Nilton Santos",pos:["LB"],r:87},{n:"Zito",pos:["CM","CDM"],r:83},{n:"Bellini",pos:["CB"],r:85},{n:"Orlando",pos:["CB"],r:79},{n:"Garrincha",pos:["RW","LW"],r:97},{n:"Didi",pos:["CM","CAM"],r:91},{n:"Vava",pos:["ST"],r:87},{n:"Pele",pos:["ST","CAM"],r:95},{n:"Zagallo",pos:["LW","CM"],r:83},{n:"Castilho",pos:["GK"],r:79},{n:"Mauro",pos:["CB","CDM"],r:78},{n:"Zozimo",pos:["CB"],r:77},{n:"De Sordi",pos:["RB"],r:76},{n:"Moacir",pos:["LB"],r:74},{n:"Joel",pos:["CM"],r:74},{n:"Mazzola",pos:["CM","CAM"],r:78},{n:"Dino",pos:["ST","RW"],r:75},{n:"Pepe",pos:["RW","LW"],r:82},{n:"Canhoteiro",pos:["LW"],r:76},{n:"Chico",pos:["CM"],r:71},{n:"Deda",pos:["ST"],r:72}]}],
 "Brazil_1962":[{y:1962,p:[{n:"Gilmar",pos:["GK"],r:87},{n:"Djalma Santos",pos:["RB"],r:84},{n:"Nilton Santos",pos:["LB"],r:85},{n:"Zito",pos:["CM","CDM"],r:82},{n:"Mauro",pos:["CB"],r:83},{n:"Zozimo",pos:["CB"],r:78},{n:"Garrincha",pos:["RW","LW"],r:97},{n:"Didi",pos:["CM","CAM"],r:88},{n:"Vava",pos:["ST"],r:84},{n:"Pele",pos:["ST","CAM"],r:97},{n:"Zagallo",pos:["LW","CM"],r:81},{n:"Amarildo",pos:["ST","CAM"],r:80},{n:"Coutinho",pos:["ST","CAM"],r:83},{n:"Castilho",pos:["GK"],r:78},{n:"Manga",pos:["GK"],r:76},{n:"Altair",pos:["LB"],r:73},{n:"Jair",pos:["RW","CM"],r:76},{n:"Pepe",pos:["RW","LW"],r:80},{n:"Mengalvio",pos:["CM"],r:74},{n:"Zequinha",pos:["CM"],r:71},{n:"Parana",pos:["LB"],r:71},{n:"Neco",pos:["RB"],r:72},{n:"Marzola",pos:["CB"],r:74}]}],
  "Brazil_2026":[{y:2026,p:[
  {n:"Alisson",pos:["GK"],r:91},{n:"Ederson",pos:["GK"],r:87},{n:"Weverton",pos:["GK"],r:78},
  {n:"Danilo",pos:["RB","RWB","CB"],r:82},{n:"Wesley",pos:["RB","RWB"],r:79},
  {n:"Marquinhos",pos:["CB"],r:88},{n:"Gabriel Magalhaes",pos:["CB"],r:85},
  {n:"Bremer",pos:["CB"],r:83},{n:"Roger Ibanez",pos:["CB"],r:79},
  {n:"Leo Pereira",pos:["CB"],r:80},{n:"Alex Sandro",pos:["LB","LWB"],r:79},
  {n:"Douglas Santos",pos:["LB","LWB"],r:77},{n:"Casemiro",pos:["CDM","CM"],r:85},
  {n:"Bruno Guimaraes",pos:["CM","CDM"],r:87},{n:"Lucas Paqueta",pos:["CM","CAM"],r:87},
  {n:"Fabinho",pos:["CDM","CM"],r:82},{n:"Danilo Santos",pos:["CDM","CM"],r:78},
  {n:"Vinicius Junior",pos:["LW","ST"],r:93},{n:"Raphinha",pos:["RW","LW"],r:87},
  {n:"Gabriel Martinelli",pos:["LW","ST"],r:84},{n:"Neymar",pos:["LW","ST","CAM"],r:84},
  {n:"Rayan",pos:["LW","RW"],r:76},{n:"Luiz Henrique",pos:["LW","RW"],r:78},
  {n:"Endrick",pos:["ST","LW"],r:83},{n:"Igor Thiago",pos:["ST"],r:79},
  {n:"Matheus Cunha",pos:["ST","LW"],r:83}
 ]}],
 "Argentina_2026":[{y:2026,p:[
  {n:"Emiliano Martinez",pos:["GK"],r:89},{n:"Geronimo Rulli",pos:["GK"],r:76},{n:"Juan Musso",pos:["GK"],r:80},
  {n:"Nahuel Molina",pos:["RB","RWB"],r:82},{n:"Gonzalo Montiel",pos:["RB","RWB"],r:78},
  {n:"Cristian Romero",pos:["CB"],r:87},{n:"Lisandro Martinez",pos:["CB"],r:86},
  {n:"Nicolas Otamendi",pos:["CB"],r:83},{n:"Leonardo Balerdi",pos:["CB"],r:77},
  {n:"Facundo Medina",pos:["CB"],r:76},{n:"Nicolas Tagliafico",pos:["LB","LWB"],r:79},
  {n:"Valentín Barco",pos:["LB","LWB"],r:75},{n:"Jose Manuel Lopez",pos:["RB","CB"],r:74},
  {n:"Rodrigo De Paul",pos:["CM","CDM"],r:86},{n:"Enzo Fernandez",pos:["CM","CDM"],r:85},
  {n:"Alexis Mac Allister",pos:["CM","CAM"],r:86},{n:"Leandro Paredes",pos:["CDM","CM"],r:80},
  {n:"Giovani Lo Celso",pos:["CM","CAM"],r:82},{n:"Exequiel Palacios",pos:["CM","CDM"],r:77},
  {n:"Thiago Almada",pos:["CAM","CM"],r:73},{n:"Giuliano Simeone",pos:["RW","LW"],r:74},
  {n:"Nico Gonzalez",pos:["LW","ST"],r:80},{n:"Nico Paz",pos:["CAM","CM"],r:76},
  {n:"Julian Alvarez",pos:["ST","LW"],r:88},{n:"Lautaro Martinez",pos:["ST"],r:87},
  {n:"Lionel Messi",pos:["CAM","RW","ST"],r:96}
 ]}],
 "France_2026":[{y:2026,p:[
  {n:"Mike Maignan",pos:["GK"],r:88},{n:"Brice Samba",pos:["GK"],r:79},{n:"Robin Risser",pos:["GK"],r:70},
  {n:"Jules Kounde",pos:["RB","CB"],r:87},{n:"Malo Gusto",pos:["RB","RWB"],r:79},
  {n:"William Saliba",pos:["CB"],r:88},{n:"Dayot Upamecano",pos:["CB"],r:85},
  {n:"Ibrahima Konate",pos:["CB"],r:84},{n:"Maxence Lacroix",pos:["CB"],r:78},
  {n:"Lucas Hernandez",pos:["LB","CB"],r:84},{n:"Theo Hernandez",pos:["LB","LWB"],r:87},
  {n:"Lucas Digne",pos:["LB","LWB"],r:80},{n:"N'Golo Kante",pos:["CDM","CM"],r:86},
  {n:"Aurelien Tchouameni",pos:["CDM","CM"],r:87},{n:"Adrien Rabiot",pos:["CM","CDM"],r:82},
  {n:"Eduardo Camavinga",pos:["CM","CDM"],r:84},{n:"Manu Kone",pos:["CDM","CM"],r:79},
  {n:"Warren Zaire-Emery",pos:["CM","CDM"],r:80},{n:"Bradley Barcola",pos:["LW","RW","ST"],r:84},
  {n:"Ousmane Dembele",pos:["RW","LW"],r:86},{n:"Michael Olise",pos:["RW","LW","CAM"],r:85},
  {n:"Desire Doue",pos:["LW","CAM"],r:80},{n:"Rayan Cherki",pos:["CAM","LW"],r:78},
  {n:"Maghnes Akliouche",pos:["CAM","LW"],r:76},{n:"Marcus Thuram",pos:["ST","LW"],r:84},
  {n:"Jean-Philippe Mateta",pos:["ST"],r:80},{n:"Kylian Mbappe",pos:["LW","ST","RW"],r:98}
 ]}],
 "Germany_2026":[{y:2026,p:[
  {n:"Manuel Neuer",pos:["GK"],r:85},{n:"Alexander Nubel",pos:["GK"],r:80},{n:"Oliver Baumann",pos:["GK"],r:77},
  {n:"Joshua Kimmich",pos:["CDM","CM","RB"],r:92},{n:"Nathaniel Brown",pos:["RB","CB"],r:74},
  {n:"Jonathan Tah",pos:["CB"],r:85},{n:"Antonio Rudiger",pos:["CB"],r:87},
  {n:"Nico Schlotterbeck",pos:["CB"],r:82},{n:"Waldemar Anton",pos:["CB","CDM"],r:79},
  {n:"Malick Thiaw",pos:["CB"],r:80},{n:"David Raum",pos:["LB","LWB"],r:81},
  {n:"Leon Goretzka",pos:["CM","CDM"],r:83},{n:"Aleksandar Pavlovic",pos:["CDM","CM"],r:78},
  {n:"Angelo Stiller",pos:["CDM","CM"],r:78},{n:"Felix Nmecha",pos:["CM","CDM"],r:77},
  {n:"Pascal Gross",pos:["CM","CAM"],r:77},{n:"Florian Wirtz",pos:["CAM","LW","CM"],r:91},
  {n:"Jamal Musiala",pos:["CAM","LW","CM"],r:91},{n:"Leroy Sane",pos:["LW","RW"],r:85},
  {n:"Serge Gnabry",pos:["RW","LW"],r:83},{n:"Jonas Hofmann",pos:["RW","CM"],r:77},
  {n:"Assan Ouedraogo",pos:["CM","CAM"],r:75},{n:"Jamie Leweling",pos:["LW","RW"],r:76},
  {n:"Maximilian Beier",pos:["ST","LW"],r:77},{n:"Kai Havertz",pos:["CAM","ST","LW"],r:86},
  {n:"Deniz Undav",pos:["ST"],r:78}
 ]}],
 "Spain_2026":[{y:2026,p:[{n:"David Raya",pos:["GK"],r:87},{n:"Robert Sanchez",pos:["GK"],r:82},{n:"Unai Simon",pos:["GK"],r:85},{n:"Dani Carvajal",pos:["RB","RWB"],r:86},{n:"Robin Le Normand",pos:["CB"],r:83},{n:"Pau Cubarsi",pos:["CB"],r:84},{n:"Aymeric Laporte",pos:["CB"],r:83},{n:"Alejandro Balde",pos:["LB","LWB"],r:83},{n:"Marc Cucurella",pos:["LB","LWB"],r:82},{n:"Rodri",pos:["CDM","CM"],r:92},{n:"Pedri",pos:["CM","CAM"],r:88},{n:"Gavi",pos:["CM","CDM"],r:85},{n:"Fabian Ruiz",pos:["CM","CAM"],r:85},{n:"Dani Olmo",pos:["CAM","LW","CM"],r:87},{n:"Nico Williams",pos:["LW","RW"],r:87},{n:"Lamine Yamal",pos:["RW","LW"],r:89},{n:"Ferran Torres",pos:["LW","ST","RW"],r:82},{n:"Alvaro Morata",pos:["ST"],r:83},{n:"Mikel Oyarzabal",pos:["ST","LW","CAM"],r:83},{n:"Martin Zubimendi",pos:["CDM","CM"],r:84},{n:"Alex Grimaldo",pos:["LB","LWB"],r:84},{n:"Eric Garcia",pos:["CB","CDM"],r:81},{n:"Joselu",pos:["ST"],r:79}]}],
 "England_2026":[{y:2026,p:[
  {n:"Jordan Pickford",pos:["GK"],r:83},{n:"Dean Henderson",pos:["GK"],r:79},{n:"James Trafford",pos:["GK"],r:76},
  {n:"Reece James",pos:["RB","RWB","CB"],r:85},{n:"Djed Spence",pos:["RB","RWB"],r:74},
  {n:"John Stones",pos:["CB"],r:85},{n:"Marc Guehi",pos:["CB"],r:82},
  {n:"Ezri Konsa",pos:["CB"],r:80},{n:"Jarell Quansah",pos:["CB"],r:77},
  {n:"Dan Burn",pos:["CB","LB"],r:76},{n:"Tino Livramento",pos:["RB","CB"],r:76},
  {n:"Declan Rice",pos:["CDM","CM"],r:88},{n:"Jordan Henderson",pos:["CM","CDM"],r:77},
  {n:"Kobbie Mainoo",pos:["CM","CDM"],r:81},{n:"Elliot Anderson",pos:["CM","CDM"],r:75},
  {n:"Nico O'Reilly",pos:["CM","CAM"],r:73},{n:"Jude Bellingham",pos:["CM","CAM"],r:91},
  {n:"Eberechi Eze",pos:["CAM","LW","RW"],r:83},{n:"Morgan Rogers",pos:["CAM","LW"],r:78},
  {n:"Anthony Gordon",pos:["LW","RW"],r:82},{n:"Bukayo Saka",pos:["RW","LW"],r:89},
  {n:"Noni Madueke",pos:["RW","LW"],r:79},{n:"Marcus Rashford",pos:["LW","ST"],r:82},
  {n:"Ollie Watkins",pos:["ST","LW"],r:83},{n:"Ivan Toney",pos:["ST"],r:80},
  {n:"Harry Kane",pos:["ST"],r:92}
 ]}],
 "Portugal_2026":[{y:2026,p:[
  {n:"Diogo Costa",pos:["GK"],r:84},{n:"Jose Sa",pos:["GK"],r:80},{n:"Rui Silva",pos:["GK"],r:75},
  {n:"Joao Cancelo",pos:["RB","LB","LWB"],r:86},{n:"Nelson Semedo",pos:["RB","RWB"],r:80},
  {n:"Diogo Dalot",pos:["RB","LB"],r:82},{n:"Ruben Dias",pos:["CB"],r:91},
  {n:"Goncalo Inacio",pos:["CB","LB"],r:82},{n:"Antonio Silva",pos:["CB"],r:80},
  {n:"Tomas Araujo",pos:["CB"],r:77},{n:"Renato Veiga",pos:["CB","LB"],r:77},
  {n:"Nuno Mendes",pos:["LB","LWB"],r:84},{n:"Joao Palhinha",pos:["CDM","CM"],r:85},
  {n:"Ruben Neves",pos:["CM","CDM"],r:83},{n:"Samu Costa",pos:["CDM","CM"],r:74},
  {n:"Vitinha",pos:["CM","CDM"],r:84},{n:"Joao Neves",pos:["CM","CDM"],r:82},
  {n:"Matheus Nunes",pos:["CM","CDM"],r:79},{n:"Bernardo Silva",pos:["CAM","RW","CM"],r:91},
  {n:"Bruno Fernandes",pos:["CAM","CM"],r:89},{n:"Pedro Neto",pos:["LW","RW"],r:83},
  {n:"Francisco Conceicao",pos:["RW","LW"],r:80},{n:"Francisco Trincao",pos:["RW","LW","ST"],r:77},
  {n:"Rafael Leao",pos:["LW","ST"],r:87},{n:"Joao Felix",pos:["CAM","ST","LW"],r:86},
  {n:"Goncalo Ramos",pos:["ST"],r:83},{n:"Cristiano Ronaldo",pos:["LW","ST","RW"],r:87}
 ]}],
 "Netherlands_2026":[{y:2026,p:[
  {n:"Bart Verbruggen",pos:["GK"],r:80},{n:"Robin Roefs",pos:["GK"],r:75},{n:"Mark Flekken",pos:["GK"],r:79},
  {n:"Denzel Dumfries",pos:["RB","RWB"],r:85},{n:"Jeremie Frimpong",pos:["RB","RWB"],r:83},
  {n:"Jurrien Timber",pos:["CB","RB"],r:86},{n:"Virgil van Dijk",pos:["CB"],r:89},
  {n:"Matthijs de Ligt",pos:["CB"],r:86},{n:"Micky van de Ven",pos:["CB","LB"],r:84},
  {n:"Jan Paul van Hecke",pos:["CB"],r:78},{n:"Jorrel Hato",pos:["LB","CB"],r:77},
  {n:"Nathan Ake",pos:["CB","LB"],r:84},{n:"Frenkie de Jong",pos:["CM","CDM"],r:88},
  {n:"Tijjani Reijnders",pos:["CM","CAM"],r:85},{n:"Ryan Gravenberch",pos:["CM","CDM"],r:84},
  {n:"Teun Koopmeiners",pos:["CM","CAM","CDM"],r:85},{n:"Marten de Roon",pos:["CDM","CM"],r:78},
  {n:"Mats Wieffer",pos:["CDM","CM"],r:78},{n:"Quinten Timber",pos:["CM","LW"],r:77},
  {n:"Donyell Malen",pos:["LW","ST"],r:82},{n:"Cody Gakpo",pos:["LW","ST"],r:86},
  {n:"Noa Lang",pos:["LW","CAM"],r:79},{n:"Justin Kluivert",pos:["LW","RW"],r:79},
  {n:"Memphis Depay",pos:["ST","LW"],r:83},{n:"Brian Brobbey",pos:["ST"],r:79},
  {n:"Crysencio Summerville",pos:["LW","RW"],r:79}
 ]}],
  "Poland_1974":[{y:1974,p:[{n:"Jan Tomaszewski",pos:["GK"],r:85},{n:"Antoni Szymanowski",pos:["RB"],r:76},{n:"Jerzy Gorgon",pos:["CB"],r:79},{n:"Adam Musial",pos:["CB"],r:77},{n:"Zygmunt Maszczyk",pos:["LB","CM"],r:74},{n:"Henryk Kasperczak",pos:["CM","CDM"],r:78},{n:"Kazimierz Deyna",pos:["CAM","CM"],r:89},{n:"Grzegorz Lato",pos:["RW","ST"],r:88},{n:"Andrzej Szarmach",pos:["ST"],r:84},{n:"Robert Gadocha",pos:["LW","ST"],r:83},{n:"Wladyslaw Zmuda",pos:["CB"],r:81},{n:"Joachim Marx",pos:["GK"],r:74},{n:"Andrzej Jarosik",pos:["GK"],r:72},{n:"Leslaw Cmikiewicz",pos:["CM"],r:74},{n:"Ryszard Szymczak",pos:["LB"],r:71},{n:"Marian Ostafiński",pos:["CM","CDM"],r:73},{n:"Alojzy Lysko",pos:["LW"],r:74},{n:"Stanislaw Terlecki",pos:["RW"],r:74},{n:"Henryk Wieczorek",pos:["ST"],r:72},{n:"Miroslaw Bulzacki",pos:["CDM","CM"],r:73},{n:"Andrzej Zając",pos:["CM"],r:71},{n:"Leszek Krowicki",pos:["CB"],r:71},{n:"Jan Banaś",pos:["LB"],r:70}]}],
 "Republic_of_Ireland":[
  
 ],
 "Chile_1962":[{y:1962,p:[{n:"Misael Escuti",pos:["GK"],r:80},{n:"Luis Eyzaguirre",pos:["RB"],r:74},{n:"Raul Sanchez",pos:["CB"],r:79},{n:"Carlos Contreras",pos:["CB"],r:76},{n:"Sergio Navarro",pos:["LB"],r:73},{n:"Jorge Toro",pos:["CM","CAM"],r:80},{n:"Carlos Rojas",pos:["CM"],r:74},{n:"Leonel Sanchez",pos:["LW","ST"],r:84},{n:"Eladio Rojas",pos:["CM","RW"],r:78},{n:"Honorino Landa",pos:["ST"],r:75},{n:"Jaime Ramirez",pos:["RW","LW"],r:76},{n:"Pedro Araya",pos:["GK"],r:75},{n:"Hugo Berly",pos:["GK"],r:71},{n:"Pedro Morales",pos:["LB"],r:72},{n:"Humberto Cruz",pos:["RB"],r:72},{n:"Hector Hernan",pos:["CB"],r:73},{n:"Carlos Campos",pos:["CM","CDM"],r:74},{n:"Jose Pena",pos:["ST"],r:73},{n:"Enrique Hormazabal",pos:["LW"],r:72},{n:"Guillermo Yaez",pos:["ST"],r:71},{n:"Hugo Moreno",pos:["CM"],r:71},{n:"Enzo Sepulveda",pos:["LB"],r:70},{n:"Pedro Gonzalez",pos:["CM"],r:71}]}],
 "Hungary_1954":[{y:1954,p:[{n:"Gyula Grosics",pos:["GK"],r:88},{n:"Jeno Buzanszky",pos:["RB"],r:79},{n:"Mihaly Lantos",pos:["LB"],r:80},{n:"Jozsef Zakarias",pos:["CDM","CM"],r:80},{n:"Gyula Lorant",pos:["CB"],r:82},{n:"Jozsef Bozsik",pos:["CM","CAM"],r:91},{n:"Zoltan Czibor",pos:["LW","RW"],r:88},{n:"Sandor Kocsis",pos:["ST","CAM"],r:94},{n:"Nandor Hidegkuti",pos:["ST","CAM"],r:92},{n:"Ferenc Puskas",pos:["LW","ST","CAM"],r:98},{n:"Mihaly Toth",pos:["LW","CM"],r:79},{n:"Karoly Sandor",pos:["RW","CM"],r:83},{n:"Lajos Tichy",pos:["ST"],r:82},{n:"Imre Budai",pos:["RW"],r:79},{n:"Lajos Csordas",pos:["GK"],r:73},{n:"Imre Kovacs",pos:["GK"],r:72},{n:"Erno Bezsenyi",pos:["RB"],r:74},{n:"Gyorgy Szepesi",pos:["LB"],r:72},{n:"Peter Kovacs",pos:["CM"],r:71},{n:"Peter Palotai",pos:["CDM"],r:71},{n:"Janos Dudas",pos:["CB"],r:72},{n:"Bela Lantos",pos:["LB"],r:71},{n:"Gyula Biro",pos:["ST"],r:75}]}],

 "Algeria_2026":[{y:2026,p:[
  {n:"Raik Belghali",pos:["GK"],r:74},{n:"Luca Zidane",pos:["GK"],r:71},{n:"Melvin Mastil",pos:["GK"],r:70},
  {n:"Aissa Mandi",pos:["CB","CDM"],r:77},{n:"Ramy Bensebaini",pos:["LB","LWB","CB"],r:79},
  {n:"Jaouen Hadjam",pos:["LB","LWB"],r:74},{n:"Rayan Ait-Nouri",pos:["LB","LWB"],r:80},
  {n:"Ramiz Zerrouki",pos:["CDM","CM"],r:75},{n:"Nabil Bentaleb",pos:["CM","CDM"],r:76},
  {n:"Hicham Boudaoui",pos:["CM","CDM"],r:76},{n:"Houssem Aouar",pos:["CM","CAM"],r:78},
  {n:"Ibrahim Maza",pos:["CM","CAM"],r:72},{n:"Oussama Benbot",pos:["CM","CDM"],r:70},
  {n:"Samir Chergui",pos:["CDM","CM"],r:70},{n:"Zineddine Belaid",pos:["CB","CM"],r:70},
  {n:"Adil Boulbina",pos:["RB","RWB"],r:72},{n:"Anis Hadj Moussa",pos:["LW","RW"],r:75},
  {n:"Fares Chaibi",pos:["LW","CAM"],r:76},{n:"Yassine Titraoui",pos:["LW","RW"],r:71},
  {n:"Nadhir Benbouali",pos:["LW","ST"],r:73},{n:"Fares Ghedjemis",pos:["LW","ST"],r:73},
  {n:"Riyad Mahrez",pos:["RW","LW","CAM"],r:86},{n:"Amine Gouiri",pos:["ST","LW","CAM"],r:80},
  {n:"Mohamed Amoura",pos:["ST","LW"],r:79},{n:"Mohamed Amine Tougai",pos:["ST"],r:70},
  {n:"Zineddine Belaid",pos:["ST","LW"],r:70}
 ]}],

 "Australia_2018":[{y:2018,p:[
  {n:"Mathew Ryan",pos:["GK"],r:78},
  {n:"Brad Jones",pos:["GK"],r:71},
  {n:"Danny Vukovic",pos:["GK"],r:72},
  {n:"Josh Risdon",pos:["RB","CB"],r:70},
  {n:"Milos Degenek",pos:["RB","CB"],r:73},
  {n:"Matthew Jurman",pos:["CB"],r:71},
  {n:"Trent Sainsbury",pos:["CB"],r:74},
  {n:"Aziz Behich",pos:["LB","LWB"],r:73},
  {n:"James Meredith",pos:["LB"],r:69},
  {n:"Mark Milligan",pos:["CDM","CB","CM"],r:74},
  {n:"Mile Jedinak",pos:["CDM","CM"],r:77},
  {n:"Massimo Luongo",pos:["CM","CDM"],r:74},
  {n:"Aaron Mooy",pos:["CM","CAM"],r:79},
  {n:"Jackson Irvine",pos:["CM","CDM"],r:73},
  {n:"Tom Rogic",pos:["CAM","CM"],r:77},
  {n:"Robbie Kruse",pos:["LW","CAM"],r:73},
  {n:"Tim Cahill",pos:["ST","CAM"],r:74},
  {n:"Mathew Leckie",pos:["RW","LW"],r:76},
  {n:"Tomi Juric",pos:["ST"],r:72},
  {n:"Jamie Maclaren",pos:["ST"],r:73},
  {n:"Andrew Nabbout",pos:["LW","ST"],r:71},
  {n:"Dimitri Petratos",pos:["RW","CAM"],r:70},
  {n:"Daniel Arzani",pos:["LW","RW"],r:72}
 ]}],

 "Australia_2022":[{y:2022,p:[
  {n:"Mathew Ryan",pos:["GK"],r:79},
  {n:"Andrew Redmayne",pos:["GK"],r:74},
  {n:"Danny Vukovic",pos:["GK"],r:71},
  {n:"Nathaniel Atkinson",pos:["RB","RWB"],r:72},
  {n:"Milos Degenek",pos:["RB","CB"],r:74},
  {n:"Fran Karacic",pos:["RB","CB"],r:71},
  {n:"Harry Souttar",pos:["CB"],r:78},
  {n:"Kye Rowles",pos:["CB"],r:74},
  {n:"Bailey Wright",pos:["CB"],r:73},
  {n:"Thomas Deng",pos:["CB","LB"],r:71},
  {n:"Joel King",pos:["LB","LWB"],r:72},
  {n:"Aziz Behich",pos:["LB","LWB"],r:73},
  {n:"Aaron Mooy",pos:["CM","CAM"],r:79},
  {n:"Jackson Irvine",pos:["CM","CDM"],r:74},
  {n:"Ajdin Hrustic",pos:["CM","CAM"],r:74},
  {n:"Cameron Devlin",pos:["CM","CDM"],r:71},
  {n:"Keanu Baccus",pos:["CM","CDM"],r:72},
  {n:"Riley McGree",pos:["CM","CAM"],r:75},
  {n:"Awer Mabil",pos:["LW","RW"],r:74},
  {n:"Craig Goodwin",pos:["LW","LB"],r:72},
  {n:"Mathew Leckie",pos:["RW","LW"],r:77},
  {n:"Garang Kuol",pos:["ST","LW"],r:71},
  {n:"Jamie Maclaren",pos:["ST"],r:74},
  {n:"Jason Cummings",pos:["ST"],r:72},
  {n:"Mitchell Duke",pos:["ST"],r:73},
  {n:"Marco Tilio",pos:["RW","LW"],r:70}
 ]}],

 "Australia_2026":[{y:2026,p:[
  {n:"Mathew Ryan",pos:["GK"],r:78},{n:"Paul Izzo",pos:["GK"],r:73},{n:"Patrick Beach",pos:["GK"],r:70},
  {n:"Jason Geria",pos:["RB","RWB"],r:73},{n:"Milos Degenek",pos:["RB","CB"],r:74},
  {n:"Harry Souttar",pos:["CB"],r:79},{n:"Cameron Burgess",pos:["CB"],r:74},
  {n:"Alessandro Circati",pos:["CB"],r:73},{n:"Aziz Behich",pos:["LB","LWB"],r:73},
  {n:"Jordan Bos",pos:["LB","LWB"],r:71},{n:"Jackson Irvine",pos:["CM","CDM"],r:75},
  {n:"Aiden O'Neill",pos:["CDM","CM"],r:73},{n:"Cameron Devlin",pos:["CM","CDM"],r:72},
  {n:"Connor Metcalfe",pos:["CM","CDM"],r:72},{n:"Ajdin Hrustic",pos:["CM","CAM"],r:74},
  {n:"Cristian Volpato",pos:["CAM","CM"],r:74},{n:"Awer Mabil",pos:["LW","RW"],r:75},
  {n:"Mathew Leckie",pos:["RW","LW"],r:77},{n:"Nestory Irankunda",pos:["LW","RW"],r:73},
  {n:"Nishan Velupillay",pos:["LW","RW"],r:71},{n:"Mohamed Toure",pos:["LW","ST"],r:72},
  {n:"Paul Okon-Engstler",pos:["CM"],r:70},{n:"Jacob Taliano",pos:["CB","CDM"],r:71},
  {n:"Lucas Herrington",pos:["CDM"],r:70},{n:"Kai Trewin",pos:["ST"],r:71},
  {n:"Tete Yengi",pos:["ST"],r:74}
 ]}],

 "Austria_2026":[{y:2026,p:[
  {n:"Patrick Pentz",pos:["GK"],r:77},{n:"Alexander Schlager",pos:["GK"],r:75},{n:"Florian Wiegele",pos:["GK"],r:70},
  {n:"Stefan Posch",pos:["RB","CB"],r:77},{n:"Phillip Mwene",pos:["RB","RWB"],r:73},
  {n:"Kevin Danso",pos:["CB"],r:82},{n:"Philipp Lienhart",pos:["CB"],r:78},
  {n:"Michael Svoboda",pos:["CB"],r:76},{n:"David Affengruber",pos:["CB"],r:73},
  {n:"David Alaba",pos:["CB","LB","CDM"],r:88},{n:"Marco Friedl",pos:["LB","CB"],r:77},
  {n:"Konrad Laimer",pos:["CM","CDM","RW"],r:83},{n:"Florian Grillitsch",pos:["CDM","CM"],r:76},
  {n:"Nicolas Seiwald",pos:["CDM","CM"],r:79},{n:"Xaver Schlager",pos:["CM","CDM"],r:80},
  {n:"Marcel Sabitzer",pos:["CM","CAM","LW"],r:83},{n:"Alexander Prass",pos:["LW","LB"],r:75},
  {n:"Romano Schmid",pos:["CM","LW"],r:75},{n:"Carney Chukwuemeka",pos:["CM","CAM"],r:77},
  {n:"Christoph Baumgartner",pos:["CAM","CM"],r:81},{n:"Patrick Wimmer",pos:["LW","RW"],r:74},
  {n:"Paul Wanner",pos:["CAM","CM"],r:74},{n:"Alessandro Schopf",pos:["CM","LW"],r:73},
  {n:"Sasa Kalajdzic",pos:["ST"],r:75},{n:"Michael Gregoritsch",pos:["ST","LW"],r:77},
  {n:"Marko Arnautovic",pos:["ST","LW"],r:80}
 ]}],

 "Bosnia_and_Herzegovina_2026":[{y:2026,p:[
  {n:"Nikola Vasilj",pos:["GK"],r:76},{n:"Amar Memic",pos:["GK"],r:72},{n:"Mladen Jurkas",pos:["GK"],r:70},
  {n:"Amar Dedic",pos:["RB","RWB"],r:78},{n:"Sead Kolasinac",pos:["LB","LWB","CB"],r:78},
  {n:"Nikola Katic",pos:["CB"],r:74},{n:"Dennis Hadzikadunic",pos:["CB"],r:75},
  {n:"Tarik Muharemovic",pos:["CB"],r:73},{n:"Ivan Basic",pos:["CB","LB"],r:72},
  {n:"Ivan Šunjic",pos:["CDM","CM"],r:76},{n:"Benjamin Tahirovic",pos:["CM","CDM"],r:78},
  {n:"Amir Hadziahmetovic",pos:["CM","CDM"],r:75},{n:"Dzenis Burnic",pos:["CM","CAM"],r:74},
  {n:"Esmir Bajraktarevic",pos:["CAM","LW"],r:72},{n:"Ermedin Demirovic",pos:["ST","LW"],r:80},
  {n:"Edin Dzeko",pos:["ST"],r:82},{n:"Haris Tabakovié",pos:["ST"],r:74},
  {n:"Samed Baždar",pos:["CM"],r:71},{n:"Armin Gigovic",pos:["CM"],r:71},
  {n:"Martin Zlomislic",pos:["LB","RB"],r:71},{n:"Kerim Alajbegovic",pos:["CM","RW"],r:71},
  {n:"Nikola Mujakic",pos:["LW","RW"],r:70},{n:"Stjepan Radeljic",pos:["RW","LW"],r:71},
  {n:"Jovo Lukic",pos:["LW","RW"],r:69},{n:"Nidal Čelik",pos:["RB","CM"],r:70},
  {n:"Ermin Mahmic",pos:["LW","ST"],r:70}
 ]}],

 "Canada_2022":[{y:2022,p:[
  {n:"Milan Borjan",pos:["GK"],r:78},
  {n:"James Pantemis",pos:["GK"],r:71},
  {n:"Dayne St. Clair",pos:["GK"],r:73},
  {n:"Richie Laryea",pos:["RB","RWB"],r:74},
  {n:"Alistair Johnston",pos:["RB","RWB"],r:75},
  {n:"Derek Cornelius",pos:["CB"],r:74},
  {n:"Joel Waterman",pos:["CB"],r:73},
  {n:"Steven Vitoria",pos:["CB"],r:73},
  {n:"Kamal Miller",pos:["CB","LB"],r:74},
  {n:"Sam Adekugbe",pos:["LB","LWB"],r:73},
  {n:"Alphonso Davies",pos:["LB","LWB","LW"],r:88},
  {n:"Atiba Hutchinson",pos:["CDM","CM"],r:77},
  {n:"Samuel Piette",pos:["CDM","CM"],r:73},
  {n:"Mark-Anthony Kaye",pos:["CM","CDM"],r:73},
  {n:"Liam Fraser",pos:["CM","CDM"],r:71},
  {n:"Ismael Kone",pos:["CM","CDM"],r:73},
  {n:"Stephen Eustaquio",pos:["CM","CAM"],r:76},
  {n:"Jonathan Osorio",pos:["CM","LW"],r:75},
  {n:"Junior Hoilett",pos:["LW","RW"],r:74},
  {n:"Tajon Buchanan",pos:["RW","LW"],r:76},
  {n:"Liam Millar",pos:["LW","ST"],r:73},
  {n:"Ike Ugbo",pos:["ST"],r:73},
  {n:"Lucas Cavallini",pos:["ST"],r:73},
  {n:"David Wotherspoon",pos:["RW","CM"],r:71},
  {n:"Cyle Larin",pos:["ST","LW"],r:77},
  {n:"Jonathan David",pos:["ST"],r:83}
 ]}],

 "Canada_2026":[{y:2026,p:[
  {n:"Dayne St. Clair",pos:["GK"],r:76},{n:"Maxime Crepeau",pos:["GK"],r:75},{n:"Owen Goodman",pos:["GK"],r:70},
  {n:"Alistair Johnston",pos:["RB","RWB"],r:77},{n:"Richie Laryea",pos:["RB","RWB"],r:75},
  {n:"Derek Cornelius",pos:["CB"],r:75},{n:"Joel Waterman",pos:["CB"],r:74},
  {n:"Alfie Jones",pos:["CB"],r:73},{n:"Moise Bombito",pos:["CB"],r:75},
  {n:"Alphonso Davies",pos:["LB","LWB","LW"],r:90},{n:"Sam Adekugbe",pos:["LB","LWB"],r:74},
  {n:"Ismael Kone",pos:["CM","CDM"],r:77},{n:"Stephen Eustaquio",pos:["CM","CAM"],r:79},
  {n:"Jonathan Osorio",pos:["CM","LW"],r:76},{n:"Ali Ahmed",pos:["CDM","CM"],r:71},
  {n:"Luc de Fougerolles",pos:["CM"],r:70},{n:"Niko Sigur",pos:["CM"],r:69},
  {n:"Tajon Buchanan",pos:["RW","LW"],r:78},{n:"Jacob Shaffelburg",pos:["LW","RW"],r:73},
  {n:"Liam Millar",pos:["LW","RW"],r:74},{n:"Mathieu Choiniere",pos:["RW","LW"],r:73},
  {n:"Nathan Saliba",pos:["GK"],r:70},{n:"Promise David",pos:["ST","LW"],r:71},
  {n:"Tani Oluwaseyi",pos:["ST","LW"],r:72},{n:"Cyle Larin",pos:["ST","LW"],r:78},
  {n:"Jonathan David",pos:["ST"],r:86}
 ]}],

 "Cape_Verde_2026":[{y:2026,p:[
  {n:"Vozinha",pos:["GK"],r:74},{n:"Marcos Rosa",pos:["GK"],r:70},{n:"Gilson Benchimol",pos:["GK"],r:70},
  {n:"Steven Moreira",pos:["RB","RWB"],r:73},{n:"Willy Semedo",pos:["LB","LWB"],r:72},
  {n:"Logan Costa",pos:["CB"],r:76},{n:"Roberto Lopes",pos:["CB"],r:75},
  {n:"Ianique Stopira",pos:["CB"],r:73},{n:"CJ dos Santos",pos:["CB","CDM"],r:74},
  {n:"Dailon Livramiento",pos:["LB","RB"],r:71},{n:"Jamiro Monteiro",pos:["CM","CDM"],r:75},
  {n:"Helio Varela",pos:["CM","CDM"],r:71},{n:"Laros Duarte",pos:["CM","LW"],r:73},
  {n:"Kevin Pina",pos:["CM","CAM"],r:72},{n:"Wagner Pina",pos:["CDM","CM"],r:70},
  {n:"Edilson Borges",pos:["CM"],r:69},{n:"Kelvin Pires",pos:["LW","RW"],r:71},
  {n:"Garry Rodrigues",pos:["LW","RW"],r:74},{n:"Ryan Mendes",pos:["RW","LW"],r:73},
  {n:"Jovane Cabral",pos:["LW","RW","ST"],r:76},{n:"Nuno da Costa",pos:["LW","ST"],r:74},
  {n:"Yannick Semedo",pos:["ST","LW"],r:70},{n:"Telmo Arcanjo",pos:["ST"],r:71},
  {n:"Joao Paulo",pos:["ST","LW"],r:71},{n:"Deroy Duarte",pos:["CM"],r:69},
  {n:"Sidny Lopes Cabral",pos:["CM","RW"],r:69}
 ]}],

 "Costa_Rica_2018":[{y:2018,p:[
  {n:"Keylor Navas",pos:["GK"],r:88},
  {n:"Patrick Pemberton",pos:["GK"],r:72},
  {n:"Leonel Moreira",pos:["GK"],r:71},
  {n:"Cristian Gamboa",pos:["RB","RWB"],r:74},
  {n:"Giancarlo Gonzalez",pos:["CB"],r:78},
  {n:"Jhonny Acosta",pos:["CB"],r:74},
  {n:"Kendall Waston",pos:["CB"],r:76},
  {n:"Oscar Duarte",pos:["CB"],r:77},
  {n:"Bryan Oviedo",pos:["LB","LWB"],r:75},
  {n:"Francisco Calvo",pos:["CB","LB"],r:74},
  {n:"Ian Smith",pos:["RB","CB"],r:70},
  {n:"David Guzman",pos:["CDM","CM"],r:74},
  {n:"Yeltsin Tejeda",pos:["CDM","CM"],r:74},
  {n:"Celso Borges",pos:["CM","CDM"],r:77},
  {n:"Randall Azofeifa",pos:["CM"],r:72},
  {n:"Kenner Gutierrez",pos:["CM"],r:69},
  {n:"Bryan Ruiz",pos:["CAM","CM"],r:80},
  {n:"Christian Bolanos",pos:["RW","LW"],r:73},
  {n:"Johan Venegas",pos:["RW","LW"],r:71},
  {n:"Rodney Wallace",pos:["LW","RW"],r:72},
  {n:"Daniel Colindres",pos:["CAM","LW"],r:70},
  {n:"Joel Campbell",pos:["RW","ST","LW"],r:78},
  {n:"Marco Urena",pos:["ST","LW"],r:74}
 ]}],

 "Costa_Rica_2022":[{y:2022,p:[
  {n:"Keylor Navas",pos:["GK"],r:85},
  {n:"Esteban Alvarado",pos:["GK"],r:73},
  {n:"Patrick Sequeira",pos:["GK"],r:70},
  {n:"Keysher Fuller",pos:["RB","RWB"],r:73},
  {n:"Cristian Gamboa",pos:["RB","RWB"],r:73},
  {n:"Juan Pablo Vargas",pos:["CB"],r:74},
  {n:"Kendall Waston",pos:["CB"],r:75},
  {n:"Oscar Duarte",pos:["CB"],r:75},
  {n:"Francisco Calvo",pos:["CB","LB"],r:73},
  {n:"Bryan Oviedo",pos:["LB","LWB"],r:74},
  {n:"Ronaldo Matarrita",pos:["LB","LWB"],r:73},
  {n:"Yeltsin Tejeda",pos:["CDM","CM"],r:74},
  {n:"Celso Borges",pos:["CM","CDM"],r:76},
  {n:"Alvaro Zamora",pos:["CDM","CM"],r:70},
  {n:"Douglas Lopez",pos:["CM","RW"],r:71},
  {n:"Carlos Martinez",pos:["CM"],r:70},
  {n:"Anthony Hernandez",pos:["CM"],r:70},
  {n:"Bryan Ruiz",pos:["CAM","CM"],r:77},
  {n:"Gerson Torres",pos:["LW","CM"],r:70},
  {n:"Roan Wilson",pos:["LW"],r:69},
  {n:"Jewison Bennette",pos:["LW","RW"],r:72},
  {n:"Johan Venegas",pos:["RW","LW"],r:71},
  {n:"Brandon Aguilera",pos:["CM","CAM"],r:71},
  {n:"Joel Campbell",pos:["RW","ST","LW"],r:77},
  {n:"Youstin Salas",pos:["ST"],r:71},
  {n:"Anthony Contreras",pos:["ST","LW"],r:71}
 ]}],

 "Curacao_2026":[{y:2026,p:[
  {n:"Eloy Room",pos:["GK"],r:75},{n:"Livano Comenencia",pos:["GK"],r:73},{n:"Godfried Roemeratoe",pos:["GK"],r:70},
  {n:"Joshua Brenet",pos:["RB","RWB"],r:75},{n:"Deveron Fonville",pos:["RB","RWB"],r:71},
  {n:"Armando Obispo",pos:["CB"],r:76},{n:"Jurien Gaari",pos:["CB","RB"],r:72},
  {n:"Riechedly Bazoer",pos:["CM","CDM","CB"],r:75},{n:"Roshon van Eijma",pos:["CB"],r:71},
  {n:"Sherel Floranus",pos:["LB","LWB"],r:72},{n:"Shurandy Sambo",pos:["CM","CDM"],r:71},
  {n:"Leandro Bacuna",pos:["CM","RW","CB"],r:75},{n:"Juninho Bacuna",pos:["CM","CAM"],r:76},
  {n:"Jeremy Antonisse",pos:["CM","CDM"],r:71},{n:"Kevin Felida",pos:["CM"],r:70},
  {n:"Jearl Margaritha",pos:["CM","LW"],r:72},{n:"Kenji Gorre",pos:["LW","RW"],r:73},
  {n:"Ar'jany Martha",pos:["LW","RW"],r:72},{n:"Gervane Kastaneer",pos:["LW","ST"],r:74},
  {n:"Tahith Chong",pos:["LW","RW","ST"],r:76},{n:"Sontje Hansen",pos:["LW","ST"],r:74},
  {n:"Tyrese Noslin",pos:["ST","LW"],r:73},{n:"Jurgen Locadia",pos:["RW","LW","ST"],r:74},
  {n:"Trevor Doornbusch",pos:["ST"],r:70},{n:"Tyrick Bodak",pos:["CDM","CM"],r:69}
 ]}],

 "DR_Congo_2026":[{y:2026,p:[
  {n:"Matthieu Epolo",pos:["GK"],r:74},{n:"Timothy Fayulu",pos:["GK"],r:72},{n:"Gael Kakuta",pos:["LW","CAM"],r:75},
  {n:"Aaron Wan-Bissaka",pos:["RB","RWB"],r:78},{n:"Chancel Mbemba",pos:["CB"],r:79},
  {n:"Dylan Batubinsika",pos:["CB"],r:74},{n:"Steve Kapuadi",pos:["CB"],r:72},
  {n:"Axel Tuanzebe",pos:["CB"],r:74},{n:"Arthur Masuaku",pos:["LB","LWB"],r:75},
  {n:"Gedeon Kalulu",pos:["LB","RB"],r:72},{n:"Edo Kayembe",pos:["CDM","CM"],r:74},
  {n:"Samuel Moutoussamy",pos:["CM","CDM"],r:74},{n:"Aaron Tshibola",pos:["CM","CDM"],r:72},
  {n:"Charles Pickel",pos:["CDM","CM"],r:73},{n:"Joris Kayembe",pos:["CM","LW"],r:72},
  {n:"Noah Sadiki",pos:["CB","LB"],r:73},{n:"Nathanael Mbuku",pos:["LW","RW"],r:74},
  {n:"Theo Bongonda",pos:["LW","RW"],r:75},{n:"Meschak Elia",pos:["LW","RW"],r:74},
  {n:"Ngalyel Mukau",pos:["LW","CAM"],r:73},{n:"Cedric Bakambu",pos:["ST","LW"],r:78},
  {n:"Simon Banza",pos:["ST","LW"],r:77},{n:"Fiston Mayele",pos:["ST"],r:75},
  {n:"Yoane Wissa",pos:["ST","LW"],r:81},{n:"Brian Cipenga",pos:["ST"],r:70},
  {n:"Lionel Mpasi",pos:["ST","LW"],r:71}
 ]}],

 "Ecuador_2022":[{y:2022,p:[
  {n:"Hernan Galindez",pos:["GK"],r:75},
  {n:"Alexander Dominguez",pos:["GK"],r:74},
  {n:"Moises Ramirez",pos:["GK"],r:72},
  {n:"Angelo Preciado",pos:["RB","RWB"],r:75},
  {n:"Xavier Arreaga",pos:["RB","CB"],r:73},
  {n:"Felix Torres",pos:["CB"],r:77},
  {n:"Robert Arboleda",pos:["CB"],r:76},
  {n:"Jackson Porozo",pos:["CB"],r:74},
  {n:"William Pacho",pos:["CB"],r:75},
  {n:"Pervis Estupinian",pos:["LB","LWB"],r:79},
  {n:"Diego Palacios",pos:["LB","LWB"],r:73},
  {n:"Moises Caicedo",pos:["CDM","CM"],r:81},
  {n:"Alan Franco",pos:["CM","CDM"],r:74},
  {n:"Carlos Gruezo",pos:["CM","CDM"],r:74},
  {n:"Jose Cifuentes",pos:["CM","CDM"],r:74},
  {n:"Sebas Mendez",pos:["CM","CDM"],r:72},
  {n:"Gonzalo Plata",pos:["RW","LW"],r:77},
  {n:"Ayrton Preciado",pos:["RW","LW"],r:73},
  {n:"Jeremy Sarmiento",pos:["LW","CAM"],r:74},
  {n:"Romario Ibarra",pos:["LW","RW"],r:72},
  {n:"Djorkaeff Reasco",pos:["LW","RW"],r:71},
  {n:"Kevin Rodriguez",pos:["RW","ST"],r:73},
  {n:"Angel Mena",pos:["ST","LW"],r:75},
  {n:"Michael Estrada",pos:["ST"],r:73},
  {n:"Enner Valencia",pos:["ST","LW"],r:80},
  {n:"Gonzalo Valle",pos:["ST"],r:70}
 ]}],

 "Ecuador_2026":[{y:2026,p:[
  {n:"Hernan Galindez",pos:["GK"],r:75},{n:"Moises Ramirez",pos:["GK"],r:73},{n:"Hernán Galíndez",pos:["GK"],r:74},
  {n:"Angelo Preciado",pos:["RB","RWB"],r:77},{n:"Yaimar Medina",pos:["RB","CB"],r:74},
  {n:"Felix Torres",pos:["CB"],r:79},{n:"Jackson Porozo",pos:["CB"],r:76},
  {n:"Joel Ordoñez",pos:["CB"],r:74},{n:"Alan Franco",pos:["CB","CM"],r:75},
  {n:"Pervis Estupinian",pos:["LB","LWB"],r:81},{n:"Piero Hincapie",pos:["LB","CB"],r:81},
  {n:"Moises Caicedo",pos:["CDM","CM"],r:85},{n:"Jordy Alcivar",pos:["CM","CDM"],r:73},
  {n:"Jeremy Arevalo",pos:["CM","CDM"],r:71},{n:"Kendry Paez",pos:["CAM","CM"],r:78},
  {n:"Gonzalo Plata",pos:["RW","LW"],r:79},{n:"Nilson Angulo",pos:["LW","RW"],r:74},
  {n:"Pedro Vite",pos:["LW","RW"],r:73},{n:"Alan Minda",pos:["LW","ST"],r:72},
  {n:"Denil Castillo",pos:["CM","LW"],r:72},{n:"Kevin Rodriguez",pos:["RW","ST"],r:75},
  {n:"John Yeboah",pos:["LW","ST"],r:73},{n:"Anthony Valencia",pos:["ST","LW"],r:71},
  {n:"Gonzalo Valle",pos:["ST"],r:72},{n:"Jordy Caicedo",pos:["ST"],r:74},
  {n:"Enner Valencia",pos:["ST","LW"],r:78}
 ]}],

 "Egypt_2018":[{y:2018,p:[
  {n:"Mohamed El Shenawy",pos:["GK"],r:77},
  {n:"Essam El Hadary",pos:["GK"],r:73},
  {n:"Sherif Ekramy",pos:["GK"],r:72},
  {n:"Ahmed Fathy",pos:["RB","CB"],r:74},
  {n:"Ahmed Hegazi",pos:["CB"],r:77},
  {n:"Ali Gabr",pos:["CB"],r:74},
  {n:"Ayman Ashraf",pos:["RB","CB"],r:71},
  {n:"Ahmed Elmohamady",pos:["RB","RWB"],r:75},
  {n:"Omar Gaber",pos:["LB","CB"],r:72},
  {n:"Mohamed Abdel Shafy",pos:["LB"],r:70},
  {n:"Tarek Hamed",pos:["CDM","CM"],r:74},
  {n:"Mohamed Elneny",pos:["CM","CDM"],r:78},
  {n:"Sam Morsy",pos:["CM","CDM"],r:73},
  {n:"Abdallah El Said",pos:["CM","CAM"],r:73},
  {n:"Mahmoud Hamdy",pos:["CM"],r:71},
  {n:"Mohamed Salah",pos:["RW","LW","ST"],r:92},
  {n:"Ramadan Sobhi",pos:["LW","CAM"],r:74},
  {n:"Amr Warda",pos:["RW","LW"],r:72},
  {n:"Kahraba",pos:["LW","RW"],r:71},
  {n:"Shikabala",pos:["RW","CAM"],r:73},
  {n:"Trézéguet",pos:["LW","RW"],r:75},
  {n:"Marwan Mohsen",pos:["ST"],r:73},
  {n:"Saad Samir",pos:["CB"],r:72}
 ]}],

 "Egypt_2026":[{y:2026,p:[
  {n:"Mohamed El Shenawy",pos:["GK"],r:79},{n:"Mostafa Shobeir",pos:["GK"],r:72},{n:"Karim Hafez",pos:["GK"],r:71},
  {n:"Mohamed Hany",pos:["RB","CB"],r:75},{n:"Ahmed Fatouh",pos:["RB"],r:72},
  {n:"Mohamed Abdelmonem",pos:["CB"],r:76},{n:"Hamza Abdelkarim",pos:["CB"],r:73},
  {n:"Nabil Emad",pos:["CB","LB"],r:72},{n:"Ramy Rabia",pos:["LB","LWB"],r:73},
  {n:"Yasser Ibrahim",pos:["LB","CB"],r:72},{n:"Tarek Alaa",pos:["CDM","CM"],r:73},
  {n:"Emam Ashour",pos:["CM","CAM"],r:77},{n:"Mahmoud Saber",pos:["CDM","CM"],r:72},
  {n:"Hossam Abdelmaguid",pos:["CM","CDM"],r:71},{n:"El Mahdy Soliman",pos:["CM","CAM"],r:73},
  {n:"Zizo",pos:["LW","CAM"],r:74},{n:"Trézéguet",pos:["LW","RW"],r:76},
  {n:"Ibrahim Adel",pos:["LW","RW"],r:76},{n:"Haissem Hassan",pos:["LW","CAM"],r:72},
  {n:"Marwan Attia",pos:["RW","LW"],r:72},{n:"Hamdy Fathy",pos:["CM","CAM"],r:73},
  {n:"Mohamed Alaa",pos:["CM"],r:70},{n:"Omar Marmoush",pos:["ST","LW","RW"],r:83},
  {n:"Mohamed Salah",pos:["RW","LW","ST"],r:91},{n:"Mohanad Lasheen",pos:["ST"],r:73},
  {n:"Mostafa Ziko",pos:["ST","LW"],r:71}
 ]}],

 "Haiti_2026":[{y:2026,p:[
  {n:"Johny Placide",pos:["GK"],r:74},{n:"Carl Saintė",pos:["GK"],r:71},{n:"Lenny Joseph",pos:["GK"],r:70},
  {n:"Jean-Kévin Duverne",pos:["RB","CB"],r:73},{n:"Hannes Delcroix",pos:["CB"],r:74},
  {n:"Woodensky Pierre",pos:["CB","LB"],r:72},{n:"Danley Jean Jacques",pos:["CB"],r:71},
  {n:"Josue Casimir",pos:["LB","LWB"],r:71},{n:"Josue Duverger",pos:["LB"],r:70},
  {n:"Carlens Arcus",pos:["CDM","CM"],r:71},{n:"Ruben Providence",pos:["CM","CDM"],r:73},
  {n:"Duke Lacroix",pos:["CM","CDM"],r:72},{n:"Jean-Ricner Bellegarde",pos:["CM","LW"],r:77},
  {n:"Frantzdy Pierrot",pos:["CM","CAM"],r:72},{n:"Leverton Pierre",pos:["CM"],r:70},
  {n:"Dominique Simon",pos:["LW","RW"],r:72},{n:"Wilguens Paugain",pos:["LW","CAM"],r:72},
  {n:"Louicius Deedson",pos:["LW","RW"],r:70},{n:"Martin Experience",pos:["RW","LW"],r:71},
  {n:"Keeto Thermoncy",pos:["RW","LW"],r:70},{n:"Duckens Nazon",pos:["LW","ST"],r:74},
  {n:"Derrick Etienne Jr.",pos:["LW","ST"],r:74},{n:"Wilson Isidor",pos:["ST","LW"],r:74},
  {n:"Ricardo Adé",pos:["ST"],r:71},{n:"Alexandre Pierre",pos:["ST"],r:70},
  {n:"Yassin Fortune",pos:["LW","ST"],r:70}
 ]}],

 "Iceland_2018":[{y:2018,p:[
  {n:"Hannes Halldorsson",pos:["GK"],r:75},
  {n:"Frederik Schram",pos:["GK"],r:69},
  {n:"Runar Alex Runarsson",pos:["GK"],r:71},
  {n:"Birkir Mar Saevarsson",pos:["RB","CB"],r:72},
  {n:"Kari Arnason",pos:["CB"],r:74},
  {n:"Ragnar Sigurdsson",pos:["CB"],r:76},
  {n:"Sverrir Ingi Ingason",pos:["CB"],r:73},
  {n:"Holmar Orn Eyjolfsson",pos:["CB"],r:71},
  {n:"Hordur Bjorgvin Magnusson",pos:["LB","CB"],r:73},
  {n:"Ari Freyr Skulason",pos:["LB","LWB"],r:71},
  {n:"Aron Gunnarsson",pos:["CDM","CM"],r:77},
  {n:"Birkir Bjarnason",pos:["CM","LW"],r:75},
  {n:"Olafur Ingi Skulason",pos:["CM","CDM"],r:71},
  {n:"Samuel Fridjonsson",pos:["CM"],r:70},
  {n:"Emil Hallfredsson",pos:["CM","CDM"],r:72},
  {n:"Gylfi Sigurdsson",pos:["CAM","CM"],r:82},
  {n:"Johann Berg Gudmundsson",pos:["RW","CM"],r:74},
  {n:"Rurik Gislason",pos:["LW","RW"],r:72},
  {n:"Arnor Ingvi Traustason",pos:["LW","CM"],r:71},
  {n:"Jon Dadi Bodvarsson",pos:["ST","LW"],r:72},
  {n:"Bjorn Bergmann Sigurdarson",pos:["ST"],r:71},
  {n:"Alfred Finnbogason",pos:["ST"],r:76},
  {n:"Albert Gudmundsson",pos:["LW","RW"],r:73}
 ]}],

 "Iraq_2026":[{y:2026,p:[
  {n:"Jalal Hassan",pos:["GK"],r:72},{n:"Mustafa Saadoon",pos:["GK"],r:70},{n:"Aimar Sher",pos:["GK"],r:69},
  {n:"Rebin Sulaka",pos:["RB","CB"],r:70},{n:"Hussein Ali",pos:["CB"],r:72},
  {n:"Mahmoud Almardi",pos:["CB"],r:71},{n:"Fahad Talib",pos:["CB"],r:70},
  {n:"Mohanad Ali",pos:["LB","CB"],r:70},{n:"Ibrahim Bayesh",pos:["LB"],r:70},
  {n:"Akam Hashim",pos:["CDM","CM"],r:73},{n:"Zidane Iqbal",pos:["CM","CDM"],r:75},
  {n:"Merchas Doski",pos:["CM","CDM"],r:71},{n:"Kevin Yakob",pos:["CM","CAM"],r:71},
  {n:"Ali Jasim",pos:["LW","CAM"],r:72},{n:"Zaid Ismail",pos:["LW","RW"],r:70},
  {n:"Aymen Hussein",pos:["RW","LW"],r:72},{n:"Frans Putros",pos:["LW","RW"],r:71},
  {n:"Manaf Younis",pos:["CM","RW"],r:70},{n:"Ahmed Basil",pos:["CM"],r:69},
  {n:"Marko Farji",pos:["ST","LW"],r:71},{n:"Ali Al-Hamadi",pos:["ST"],r:74},
  {n:"Ali Yousif",pos:["ST"],r:70},{n:"Ahmed Qasem",pos:["LW","ST"],r:69},
  {n:"Youssef Amyn",pos:["CM"],r:70},{n:"Ahmed Maknzi",pos:["LW","ST"],r:70},
  {n:"Assim Madibo",pos:["CDM","CM"],r:72}
 ]}],

 "Jordan_2026":[{y:2026,p:[
  {n:"Amer Jamous",pos:["GK"],r:70},{n:"Ibrahim Sadeh",pos:["GK"],r:69},{n:"Ehsan Haddad",pos:["GK"],r:68},
  {n:"Ali Olwan",pos:["RB","CB"],r:69},{n:"Nour Baniateyah",pos:["CB"],r:71},
  {n:"Mahmoud Almardi",pos:["CB"],r:70},{n:"Mohammad Abuzraiq",pos:["CB"],r:69},
  {n:"Abdallah Alfakhori",pos:["LB","CB"],r:69},{n:"Sa'ed Alrosan",pos:["LB","LWB"],r:70},
  {n:"Husam Abudahab",pos:["LB"],r:69},{n:"Saleem Obaid",pos:["CM","CDM"],r:70},
  {n:"Ibrahim Sabra",pos:["CM","CDM"],r:69},{n:"Odeh Fakhouri",pos:["CDM","CM"],r:68},
  {n:"Abdallah Nasib",pos:["CM"],r:68},{n:"Mohammad Abualnadi",pos:["CM"],r:68},
  {n:"Nizar Alrashdan",pos:["CM","LW"],r:69},{n:"Ali Azaizeh",pos:["LW","CAM"],r:71},
  {n:"Anas Badawi",pos:["LW","RW"],r:70},{n:"Mohannad Abutaha",pos:["LW","ST"],r:70},
  {n:"Mohammad Abuhasheesh",pos:["RW","LW"],r:70},{n:"Mohammad Aldaoud",pos:["CAM","CM"],r:69},
  {n:"Mousa Altamari",pos:["RW","ST"],r:71},{n:"Yazan Alarab",pos:["ST","LW"],r:69},
  {n:"Raja'ei Ayed",pos:["ST"],r:68},{n:"Yazeed Abulaila",pos:["ST"],r:68},
  {n:"Ali Yousif",pos:["ST"],r:68}
 ]}],

 "New_Zealand_2026":[{y:2026,p:[
  {n:"Mathew Ryan",pos:["GK"],r:75},{n:"Michael Woud",pos:["GK"],r:73},{n:"Max Crocombe",pos:["GK"],r:72},
  {n:"Liberato Cacace",pos:["LB","LWB","CB"],r:77},{n:"Nando Pijnaker",pos:["CB"],r:74},
  {n:"Michael Boxall",pos:["CB"],r:74},{n:"Tim Payne",pos:["CB","RB"],r:71},
  {n:"Alex Paulsen",pos:["RB","CB"],r:70},{n:"Tyler Bindon",pos:["CB"],r:71},
  {n:"Francis De Vries",pos:["LB","CB"],r:70},{n:"Joe Bell",pos:["CDM","CM"],r:76},
  {n:"Marko Stamenic",pos:["CM","CDM"],r:74},{n:"Matthew Garbett",pos:["CM","CDM"],r:72},
  {n:"Alex Rufer",pos:["CM"],r:71},{n:"Sarpreet Singh",pos:["CAM","CM","LW"],r:74},
  {n:"Callan Elliot",pos:["LW","CAM"],r:72},{n:"Jesse Randall",pos:["CM","RW"],r:70},
  {n:"Callum McCowatt",pos:["LW","CAM"],r:72},{n:"Ben Waine",pos:["LW","ST"],r:73},
  {n:"Ben Old",pos:["CAM","LW"],r:71},{n:"Elijah Just",pos:["LW","ST"],r:70},
  {n:"Finn Surman",pos:["ST"],r:69},{n:"Chris Wood",pos:["ST"],r:79},
  {n:"Finn Surman",pos:["ST"],r:69}
 ]}],

 "Norway_2026":[{y:2026,p:[
  {n:"Orjan Nyland",pos:["GK"],r:78},{n:"Egil Selvik",pos:["GK"],r:75},{n:"Henrik Falchener",pos:["GK"],r:71},
  {n:"Julian Ryerson",pos:["RB","RWB"],r:78},{n:"Marcus Holmgren Pedersen",pos:["RB","RWB"],r:76},
  {n:"Leo Ostigard",pos:["CB"],r:79},{n:"Kristoffer Ajer",pos:["CB","RB"],r:80},
  {n:"Torbjorn Heggem",pos:["CB","LB"],r:72},{n:"Fredrik Andre Bjorkan",pos:["LB","LWB"],r:75},
  {n:"Sander Tangvik",pos:["LB"],r:71},{n:"Patrick Berg",pos:["CDM","CM"],r:77},
  {n:"Fredrik Aursnes",pos:["CDM","CM"],r:80},{n:"Sander Berge",pos:["CDM","CM"],r:81},
  {n:"Morten Thorsby",pos:["CM","CDM"],r:75},{n:"Kristian Thorstvedt",pos:["CM","CDM"],r:77},
  {n:"Thelo Aasgaard",pos:["CM","CAM"],r:73},{n:"Martin Odegaard",pos:["CAM","CM"],r:90},
  {n:"Oscar Bobb",pos:["RW","LW"],r:78},{n:"Jens Petter Hauge",pos:["LW","RW"],r:76},
  {n:"Antonio Nusa",pos:["LW","RW"],r:80},{n:"Andreas Schjelderup",pos:["LW","ST"],r:77},
  {n:"David Moller Wolfe",pos:["LW","CM"],r:73},{n:"Sondre Langas",pos:["LW","RW"],r:73},
  {n:"Alexander Sorloth",pos:["ST"],r:82},{n:"Jørgen Strand Larsen",pos:["ST"],r:80},
  {n:"Erling Haaland",pos:["ST"],r:99}
 ]}],

 "Panama_2018":[{y:2018,p:[
  {n:"Jaime Penedo",pos:["GK"],r:75},
  {n:"Jose Calderon",pos:["GK"],r:71},
  {n:"Luis Ovalle",pos:["GK"],r:69},
  {n:"Michael Amir Murillo",pos:["RB","RWB"],r:73},
  {n:"Adolfo Machado",pos:["CB"],r:74},
  {n:"Roman Torres",pos:["CB"],r:76},
  {n:"Harold Cummings",pos:["CB"],r:73},
  {n:"Felipe Baloy",pos:["CB"],r:74},
  {n:"Fidel Escobar",pos:["CB","LB"],r:72},
  {n:"Eric Davis",pos:["LB","LWB"],r:72},
  {n:"Erick Davis",pos:["RB"],r:71},
  {n:"Jose Luis Rodriguez",pos:["LB"],r:70},
  {n:"Anibal Godoy",pos:["CDM","CM"],r:74},
  {n:"Gabriel Gomez",pos:["CDM","CM"],r:73},
  {n:"Alex Rodriguez",pos:["CM"],r:70},
  {n:"Valentin Pimentel",pos:["CM"],r:69},
  {n:"Ricardo Avila",pos:["CM"],r:69},
  {n:"Armando Cooper",pos:["RW","LW"],r:72},
  {n:"Edgar Barcenas",pos:["LW","CAM"],r:71},
  {n:"Ismael Diaz",pos:["LW","ST"],r:72},
  {n:"Abdiel Arroyo",pos:["LW","ST"],r:70},
  {n:"Gabriel Torres",pos:["ST"],r:72},
  {n:"Blas Perez",pos:["ST"],r:73},
  {n:"Luis Tejada",pos:["ST"],r:72}
 ]}],

 "Panama_2026":[{y:2026,p:[
  {n:"Luis Mejia",pos:["GK"],r:76},{n:"Orlando Mosquera",pos:["GK"],r:72},{n:"Roderick Miller",pos:["GK"],r:71},
  {n:"Michael Amir Murillo",pos:["RB","RWB"],r:76},{n:"Jiovany Ramos",pos:["RB","CB"],r:71},
  {n:"Harold Cummings",pos:["CB"],r:74},{n:"Fidel Escobar",pos:["CB","LB"],r:73},
  {n:"Omar Alderete",pos:["CB"],r:74},{n:"Eric Davis",pos:["LB","LWB"],r:73},
  {n:"Jose Luis Rodriguez",pos:["LB"],r:71},{n:"Cesar Samudio",pos:["CB","RB"],r:72},
  {n:"Anibal Godoy",pos:["CDM","CM"],r:75},{n:"Adalberto Carrasquilla",pos:["CM","CDM"],r:76},
  {n:"Andres Andrade",pos:["CDM","CM"],r:74},{n:"Cesar Blackman",pos:["CM"],r:72},
  {n:"Carlos Harvey",pos:["CM","CDM"],r:71},{n:"Edgardo Farina",pos:["CM"],r:70},
  {n:"Jose Fajardo",pos:["RW","LW"],r:72},{n:"Cecilio Waterman",pos:["LW","ST"],r:73},
  {n:"Ismael Diaz",pos:["LW","ST"],r:74},{n:"Yoel Barcenas",pos:["LW","RW"],r:73},
  {n:"Cesar Yanis",pos:["LW","RW"],r:71},{n:"Jose Cordoba",pos:["LW","ST"],r:71},
  {n:"Alberto Quintero",pos:["LW","CM"],r:74},{n:"Cristian Martinez",pos:["ST"],r:72},
  {n:"Jorge Gutierrez",pos:["ST","LW"],r:71}
 ]}],

 "Paraguay_2026":[{y:2026,p:[
  {n:"Gatito Fernandez",pos:["GK"],r:78},{n:"Gastón Olveira",pos:["GK"],r:73},{n:"Orlando Gill",pos:["GK"],r:70},
  {n:"Jose Canale",pos:["RB","RWB"],r:71},{n:"Juan Jose Caceres",pos:["RB","CB"],r:73},
  {n:"Fabián Balbuena",pos:["CB"],r:79},{n:"Gustavo Gomez",pos:["CB"],r:80},
  {n:"Junior Alonso",pos:["CB"],r:76},{n:"Omar Alderete",pos:["CB"],r:74},
  {n:"Alexandro Maidana",pos:["LB","CB"],r:73},{n:"Matias Galarza",pos:["LB","LWB"],r:72},
  {n:"Andres Cubas",pos:["CDM","CM"],r:76},{n:"Braian Ojeda",pos:["CDM","CM"],r:74},
  {n:"Damian Bobadilla",pos:["CM","CDM"],r:74},{n:"Gustavo Caballero",pos:["CM"],r:71},
  {n:"Diego Gomez",pos:["CM","CAM"],r:77},{n:"Kaku",pos:["CAM","CM"],r:75},
  {n:"Gustavo Velazquez",pos:["CM","LW"],r:72},{n:"Miguel Almiron",pos:["CAM","CM","LW"],r:81},
  {n:"Julio Enciso",pos:["LW","CAM"],r:79},{n:"Ramón Sosa",pos:["RW","LW"],r:78},
  {n:"Mauricio",pos:["LW","ST"],r:73},{n:"Gabriel Avalos",pos:["ST"],r:74},
  {n:"Alex Arce",pos:["ST"],r:72},{n:"Isidro Pitta",pos:["ST"],r:73},
  {n:"Antonio Sanabria",pos:["ST","LW"],r:77}
 ]}],

 "Peru_2018":[{y:2018,p:[
  {n:"Pedro Gallese",pos:["GK"],r:77},
  {n:"Jose Carvallo",pos:["GK"],r:73},
  {n:"Carlos Caceda",pos:["GK"],r:71},
  {n:"Luis Advincula",pos:["RB","RWB"],r:77},
  {n:"Aldo Corzo",pos:["RB","CB"],r:73},
  {n:"Alberto Rodriguez",pos:["CB"],r:76},
  {n:"Anderson Santamaria",pos:["CB"],r:73},
  {n:"Christian Ramos",pos:["CB"],r:74},
  {n:"Miguel Araujo",pos:["CB"],r:72},
  {n:"Miguel Trauco",pos:["LB","LWB"],r:75},
  {n:"Nilson Loyola",pos:["LB"],r:70},
  {n:"Renato Tapia",pos:["CDM","CM"],r:77},
  {n:"Pedro Aquino",pos:["CDM","CM"],r:74},
  {n:"Yoshimar Yotun",pos:["CM","CDM"],r:75},
  {n:"Wilder Cartagena",pos:["CM","CDM"],r:73},
  {n:"Christian Cueva",pos:["CAM","CM","LW"],r:80},
  {n:"Andy Polo",pos:["LW","RW"],r:72},
  {n:"Paolo Hurtado",pos:["LW","RW"],r:73},
  {n:"Andre Carrillo",pos:["RW","LW"],r:78},
  {n:"Edison Flores",pos:["LW","CAM"],r:74},
  {n:"Jefferson Farfan",pos:["RW","ST"],r:79},
  {n:"Paolo Guerrero",pos:["ST"],r:82},
  {n:"Raul Ruidiaz",pos:["ST","LW"],r:74}
 ]}],

 "Poland_2018":[{y:2018,p:[
  {n:"Wojciech Szczesny",pos:["GK"],r:86},
  {n:"Lukasz Fabianski",pos:["GK"],r:80},
  {n:"Bartosz Bialkowski",pos:["GK"],r:74},
  {n:"Lukasz Piszczek",pos:["RB","RWB"],r:79},
  {n:"Bartosz Bereszynski",pos:["RB","CB"],r:74},
  {n:"Kamil Glik",pos:["CB"],r:82},
  {n:"Jan Bednarek",pos:["CB"],r:77},
  {n:"Michal Pazdan",pos:["CB"],r:73},
  {n:"Thiago Cionek",pos:["CB"],r:73},
  {n:"Artur Jedrzejczyk",pos:["LB","CB"],r:73},
  {n:"Maciej Rybus",pos:["LB","LWB"],r:74},
  {n:"Grzegorz Krychowiak",pos:["CDM","CM"],r:81},
  {n:"Jacek Goralski",pos:["CDM","CM"],r:73},
  {n:"Karol Linetty",pos:["CM","CAM"],r:74},
  {n:"Rafal Kurzawa",pos:["LW","LB"],r:71},
  {n:"Piotr Zielinski",pos:["CAM","CM","LW"],r:83},
  {n:"Jakub Blaszczykowski",pos:["RW","LW"],r:77},
  {n:"Kamil Grosicki",pos:["LW","RW"],r:76},
  {n:"Slawomir Peszko",pos:["LW","RW"],r:70},
  {n:"Arkadiusz Milik",pos:["ST"],r:81},
  {n:"Lukasz Teodorczyk",pos:["ST"],r:72},
  {n:"Dawid Kownacki",pos:["ST","LW"],r:71},
  {n:"Robert Lewandowski",pos:["ST"],r:94}
 ]}],

 "Poland_2022":[{y:2022,p:[
  {n:"Wojciech Szczesny",pos:["GK"],r:86},
  {n:"Lukasz Skorupski",pos:["GK"],r:79},
  {n:"Kamil Grabara",pos:["GK"],r:77},
  {n:"Matty Cash",pos:["RB","RWB"],r:78},
  {n:"Bartosz Bereszynski",pos:["RB","CB"],r:75},
  {n:"Robert Gumny",pos:["RB"],r:71},
  {n:"Kamil Glik",pos:["CB"],r:80},
  {n:"Jan Bednarek",pos:["CB"],r:79},
  {n:"Jakub Kiwior",pos:["CB","LB"],r:76},
  {n:"Mateusz Wieteska",pos:["CB"],r:73},
  {n:"Artur Jedrzejczyk",pos:["LB","CB"],r:72},
  {n:"Maciej Rybus",pos:["LB","LWB"],r:73},
  {n:"Grzegorz Krychowiak",pos:["CDM","CM"],r:79},
  {n:"Damian Szymanski",pos:["CM","CDM"],r:73},
  {n:"Krystian Bielik",pos:["CDM","CM"],r:74},
  {n:"Szymon Zurkowski",pos:["CM"],r:72},
  {n:"Piotr Zielinski",pos:["CAM","CM","LW"],r:85},
  {n:"Sebastian Szymanski",pos:["CM","CAM"],r:77},
  {n:"Nicola Zalewski",pos:["LW","LB"],r:74},
  {n:"Jakub Kaminski",pos:["LW","RW"],r:73},
  {n:"Kamil Grosicki",pos:["LW","RW"],r:75},
  {n:"Michal Skoras",pos:["LW","RW"],r:70},
  {n:"Przemyslaw Frankowski",pos:["RW","LW"],r:74},
  {n:"Krzysztof Piatek",pos:["ST"],r:77},
  {n:"Arkadiusz Milik",pos:["ST"],r:81},
  {n:"Karol Swiderski",pos:["ST","LW"],r:75},
  {n:"Robert Lewandowski",pos:["ST"],r:94}
 ]}],

 "Qatar_2022":[{y:2022,p:[
  {n:"Saad Al-Sheeb",pos:["GK"],r:74},
  {n:"Meshaal Barsham",pos:["GK"],r:73},
  {n:"Yousef Hassan",pos:["GK"],r:70},
  {n:"Pedro Miguel",pos:["RB","RWB"],r:72},
  {n:"Salem Al-Hajri",pos:["RB","CB"],r:71},
  {n:"Bassam Al-Rawi",pos:["CB"],r:73},
  {n:"Boualem Khoukhi",pos:["CB"],r:75},
  {n:"Tarek Salman",pos:["CB"],r:70},
  {n:"Abdulaziz Hatem",pos:["LB","CB"],r:72},
  {n:"Abdelkarim Hassan",pos:["LB","LWB"],r:75},
  {n:"Ismaeel Mohammad",pos:["RB"],r:70},
  {n:"Karim Boudiaf",pos:["CDM","CM"],r:74},
  {n:"Assim Madibo",pos:["CDM","CM"],r:73},
  {n:"Abdullah Al-Khaibari",pos:["CM","CDM"],r:69}, 
  {n:"Abdulaziz Hatem",pos:["CM","CAM"],r:72},
  {n:"Homam Ahmed",pos:["CM","CDM"],r:71},
  {n:"Ali Assadalla",pos:["LW","CAM"],r:71},
  {n:"Hassan Al-Haydos",pos:["CAM","RW","CM"],r:76},
  {n:"Ro-Ro",pos:["LW","ST"],r:72},
  {n:"Akram Afif",pos:["LW","CAM"],r:79},
  {n:"Jassem Gaber",pos:["RW","LW"],r:70},
  {n:"Ahmed Alaaeldin",pos:["CM","LW"],r:70},
  {n:"Khalid Muneer",pos:["LW"],r:70},
  {n:"Musab Kheder",pos:["CM"],r:70},
  {n:"Almoez Ali",pos:["ST"],r:77},
  {n:"Mohammed Muntari",pos:["ST"],r:75}
 ]}],

 "Qatar_2026":[{y:2026,p:[
  {n:"Meshaal Barsham",pos:["GK"],r:74},{n:"Jassem Gaber",pos:["GK"],r:70},{n:"Salah Zakaria",pos:["GK"],r:69},
  {n:"Pedro Miguel",pos:["RB","RWB"],r:72},{n:"Lucas Mendes",pos:["RB","CB"],r:72},
  {n:"Sultan Al-Brake",pos:["CB"],r:73},{n:"Boualem Khoukhi",pos:["CB"],r:74},
  {n:"Abdelkarim Hassan",pos:["LB","LWB"],r:75},{n:"Karim Boudiaf",pos:["CDM","CM"],r:74},
  {n:"Assim Madibo",pos:["CDM","CM"],r:73},{n:"Homam Ahmed",pos:["CM","CDM"],r:71},
  {n:"Hassan Al-Haydos",pos:["CAM","RW","CM"],r:77},{n:"Abdulaziz Hatem",pos:["CM","CAM"],r:72},
  {n:"Ahmed Alaaeldin",pos:["LW","CAM"],r:70},{n:"Tahsin Jamshid",pos:["CM"],r:69},
  {n:"Yusuf Abdurisag",pos:["LW","RW"],r:71},{n:"Mahmud Abunada",pos:["LW","ST"],r:70},
  {n:"Edmilson Junior",pos:["CM","LW"],r:72},{n:"Issa Laye",pos:["CM","LW"],r:70},
  {n:"Ayoub Al-Oui",pos:["LW","RW"],r:70},{n:"Mohamed Manai",pos:["CM"],r:70},
  {n:"Mohammed Waad",pos:["LB"],r:69},{n:"Ahmed Fathy",pos:["CM","CDM"],r:70},
  {n:"Al-Hashmi Al-Hussain",pos:["CM"],r:69},{n:"Akram Afif",pos:["LW","CAM"],r:80},
  {n:"Almoez Ali",pos:["ST"],r:78},{n:"Mohammed Muntari",pos:["ST"],r:75}
 ]}],

 "Russia_2018":[{y:2018,p:[
  {n:"Igor Akinfeev",pos:["GK"],r:81},
  {n:"Andrey Lunyov",pos:["GK"],r:74},
  {n:"Vladimir Gabulov",pos:["GK"],r:72},
  {n:"Igor Smolnikov",pos:["RB","RWB"],r:74},
  {n:"Mario Fernandes",pos:["RB","RWB"],r:77},
  {n:"Andrei Semyonov",pos:["CB"],r:73},
  {n:"Ilya Kutepov",pos:["CB"],r:74},
  {n:"Sergei Ignashevich",pos:["CB"],r:76},
  {n:"Fyodor Kudryashov",pos:["LB","CB"],r:73},
  {n:"Vladimir Granat",pos:["CB","LB"],r:72},
  {n:"Yuri Zhirkov",pos:["LB","LWB","LM"],r:75},
  {n:"Roman Zobnin",pos:["CM","CDM"],r:75},
  {n:"Alan Dzagoev",pos:["CM","CAM"],r:77},
  {n:"Daler Kuzyayev",pos:["CM","LW"],r:73},
  {n:"Yury Gazinsky",pos:["CM","CDM"],r:72},
  {n:"Aleksandr Yerokhin",pos:["CM","CDM"],r:70},
  {n:"Aleksandr Golovin",pos:["CAM","CM","LW"],r:78},
  {n:"Aleksandr Samedov",pos:["RW","LW"],r:74},
  {n:"Denis Cheryshev",pos:["LW","CAM"],r:78},
  {n:"Aleksei Miranchuk",pos:["CAM","LW"],r:75},
  {n:"Anton Miranchuk",pos:["CAM","CM"],r:74},
  {n:"Artem Dzyuba",pos:["ST"],r:80},
  {n:"Fyodor Smolov",pos:["ST","LW"],r:77}
 ]}],

 "Saudi_Arabia_2018":[{y:2018,p:[
  {n:"Mohammed Al-Owais",pos:["GK"],r:76},
  {n:"Abdullah Al-Mayouf",pos:["GK"],r:71},
  {n:"Yasser Al-Mosailem",pos:["GK"],r:70},
  {n:"Mansoor Al-Harbi",pos:["RB","CB"],r:71},
  {n:"Motaz Hawsawi",pos:["CB"],r:73},
  {n:"Omar Hawsawi",pos:["CB"],r:75},
  {n:"Osama Hawsawi",pos:["CB","LB"],r:74},
  {n:"Ali Al-Bulaihi",pos:["LB","CB"],r:73},
  {n:"Yasser Al-Shahrani",pos:["LB","LWB"],r:74},
  {n:"Mohammed Al-Breik",pos:["LB"],r:70},
  {n:"Abdulmalek Al-Khaibri",pos:["RB"],r:70},
  {n:"Abdullah Al-Khaibari",pos:["CM","CDM"],r:72},
  {n:"Salman Al-Faraj",pos:["CM","CDM"],r:76},
  {n:"Mohammed Kanno",pos:["CDM","CM"],r:74},
  {n:"Abdullah Otayf",pos:["CM","CDM"],r:73},
  {n:"Taisir Al-Jassim",pos:["CM","LW"],r:70},
  {n:"Hattan Bahebri",pos:["RW","LW"],r:72},
  {n:"Housain Al-Mogahwi",pos:["CM"],r:69},
  {n:"Salem Al-Dawsari",pos:["LW","CAM"],r:74},
  {n:"Fahad Al-Muwallad",pos:["LW","RW"],r:73},
  {n:"Yahya Al-Shehri",pos:["LW","RW"],r:70},
  {n:"Muhannad Assiri",pos:["ST"],r:71},
  {n:"Mohammad Al-Sahlawi",pos:["ST"],r:73}
 ]}],

 "Saudi_Arabia_2022":[{y:2022,p:[
  {n:"Mohammed Al-Owais",pos:["GK"],r:78},
  {n:"Nawaf Al-Aqidi",pos:["GK"],r:72},
  {n:"Sami Al-Najei",pos:["GK"],r:69},
  {n:"Saud Abdulhamid",pos:["RB","RWB"],r:76},
  {n:"Sultan Al-Ghannam",pos:["RB","CB"],r:72},
  {n:"Abdulelah Al-Amri",pos:["CB"],r:74},
  {n:"Hassan Al-Tambakti",pos:["CB"],r:76},
  {n:"Ali Al-Bulaihi",pos:["LB","CB"],r:74},
  {n:"Mohammed Al-Breik",pos:["LB"],r:71},
  {n:"Yasser Al-Shahrani",pos:["LB","LWB"],r:74},
  {n:"Abdullah Madu",pos:["CM","CDM"],r:70},
  {n:"Mohammed Kanno",pos:["CDM","CM"],r:76},
  {n:"Abdullah Otayf",pos:["CM","CDM"],r:74},
  {n:"Salman Al-Faraj",pos:["CM","CDM"],r:76},
  {n:"Ali Al-Hassan",pos:["CM"],r:70},
  {n:"Abdulellah Al-Malki",pos:["CM","CAM"],r:70},
  {n:"Abdulrahman Al-Aboud",pos:["CM","CAM"],r:72},
  {n:"Mohamed Al-Rubaie",pos:["LW","CM"],r:70},
  {n:"Hattan Bahebri",pos:["RW","LW"],r:73},
  {n:"Salem Al-Dawsari",pos:["LW","CAM"],r:77},
  {n:"Nasser Al-Dawsari",pos:["RW","LW"],r:72},
  {n:"Riyadh Sharahili",pos:["CM","LW"],r:71},
  {n:"Nawaf Al-Abed",pos:["CM"],r:70},
  {n:"Saleh Al-Shehri",pos:["ST","LW"],r:74},
  {n:"Firas Al-Buraikan",pos:["ST"],r:74},
  {n:"Haitham Asiri",pos:["ST"],r:71}
 ]}],

 "Saudi_Arabia_2026":[{y:2026,p:[
  {n:"Mohammed Al-Owais",pos:["GK"],r:80},{n:"Nawaf Al-Aqidi",pos:["GK"],r:74},{n:"Ahmed Al-Kassar",pos:["GK"],r:70},
  {n:"Saud Abdulhamid",pos:["RB","RWB"],r:79},{n:"Hassan Al-Tambakti",pos:["CB"],r:77},
  {n:"Ali Lajami",pos:["CB"],r:75},{n:"Abdulelah Al-Amri",pos:["CB"],r:75},
  {n:"Ali Majrashi",pos:["CB","LB"],r:73},{n:"Ayman Yahya",pos:["LB","LWB"],r:73},
  {n:"Nawaf Boushal",pos:["LB"],r:72},{n:"Mohammed Kanno",pos:["CDM","CM"],r:78},
  {n:"Salman Al-Faraj",pos:["CM","CDM"],r:75},{n:"Abdullah Al-Khaibari",pos:["CDM","CM"],r:72},
  {n:"Jehad Thakri",pos:["CM","CDM"],r:72},{n:"Hassan Kadesh",pos:["CM","LW"],r:72},
  {n:"Firas Al-Buraikan",pos:["ST","LW"],r:77},{n:"Nasser Al-Dawsari",pos:["LW","RW"],r:74},
  {n:"Salem Al-Dawsari",pos:["LW","CAM"],r:79},{n:"Saleh Al-Shehri",pos:["ST","LW"],r:76},
  {n:"Abdullah Al-Hamdan",pos:["ST"],r:75},{n:"Sultan Mandash",pos:["LW","RW"],r:71},
  {n:"Musab Al-Juwayr",pos:["CM"],r:71},{n:"Alaa Al-Hejji",pos:["ST","LW"],r:73},
  {n:"Ali Al-Hassan",pos:["CM"],r:70},{n:"Ziyad Al-Johani",pos:["ST"],r:73},
  {n:"Moteb Al-Harbi",pos:["RW","LW"],r:70}
 ]}],

 "Scotland_2026":[{y:2026,p:[
  {n:"Craig Gordon",pos:["GK"],r:77},{n:"Angus Gunn",pos:["GK"],r:76},{n:"Liam Kelly",pos:["GK"],r:73},
  {n:"Nathan Patterson",pos:["RB","RWB"],r:77},{n:"Anthony Ralston",pos:["RB","CB"],r:74},
  {n:"Grant Hanley",pos:["CB"],r:76},{n:"Jack Hendry",pos:["CB"],r:75},
  {n:"John Souttar",pos:["CB"],r:74},{n:"Scott McKenna",pos:["CB"],r:76},
  {n:"Dominic Hyam",pos:["CB"],r:73},{n:"Andy Robertson",pos:["LB","LWB"],r:87},
  {n:"Kieran Tierney",pos:["LB","LWB"],r:82},{n:"Aaron Hickey",pos:["LB","RB","LWB"],r:78},
  {n:"Scott McTominay",pos:["CM","CDM"],r:82},{n:"John McGinn",pos:["CM","CAM"],r:82},
  {n:"Lewis Ferguson",pos:["CM","CDM"],r:78},{n:"Kenny McLean",pos:["CM","CDM"],r:74},
  {n:"Ryan Christie",pos:["CAM","CM"],r:76},{n:"Ben Gannon-Doak",pos:["LW","RW"],r:72},
  {n:"Findlay Curtis",pos:["LW","RW"],r:71},{n:"Che Adams",pos:["LW","ST"],r:77},
  {n:"Lawrence Shankland",pos:["ST"],r:78},{n:"Lyndon Dykes",pos:["ST"],r:74},
  {n:"George Hirst",pos:["ST"],r:73},{n:"Ross Stewart",pos:["ST"],r:73},
  {n:"Tyler Fletcher",pos:["ST"],r:70}
 ]}],

 "Serbia_2018":[{y:2018,p:[
  {n:"Vladimir Stojkovic",pos:["GK"],r:75},
  {n:"Marko Dmitrovic",pos:["GK"],r:75},
  {n:"Predrag Rajkovic",pos:["GK"],r:76},
  {n:"Antonio Rukavina",pos:["RB","CB"],r:74},
  {n:"Branislav Ivanovic",pos:["RB","CB"],r:79},
  {n:"Nikola Milenkovic",pos:["CB"],r:78},
  {n:"Milos Veljkovic",pos:["CB"],r:75},
  {n:"Uroš Spajic",pos:["CB"],r:72},
  {n:"Dusko Tosic",pos:["LB","CB"],r:73},
  {n:"Aleksandar Kolarov",pos:["LB","LWB"],r:80},
  {n:"Milan Rodic",pos:["LB"],r:71},
  {n:"Nemanja Matic",pos:["CDM","CM"],r:84},
  {n:"Luka Milivojevic",pos:["CDM","CM"],r:78},
  {n:"Marko Grujic",pos:["CM","CDM"],r:74},
  {n:"Sergej Milinkovic-Savic",pos:["CM","CAM"],r:85},
  {n:"Dusan Tadic",pos:["LW","CAM","RW"],r:84},
  {n:"Filip Kostic",pos:["LW","LB"],r:80},
  {n:"Adem Ljajic",pos:["CAM","LW"],r:77},
  {n:"Andrija Zivkovic",pos:["LW","RW"],r:73},
  {n:"Nemanja Radonjic",pos:["LW","ST"],r:73},
  {n:"Luka Jovic",pos:["ST","CAM"],r:78},
  {n:"Aleksandar Mitrovic",pos:["ST"],r:82},
  {n:"Aleksandar Prijovic",pos:["ST"],r:73}
 ]}],

 "Serbia_2022":[{y:2022,p:[
  {n:"Vanja Milinkovic-Savic",pos:["GK"],r:79},
  {n:"Predrag Rajkovic",pos:["GK"],r:77},
  {n:"Marko Dmitrovic",pos:["GK"],r:76},
  {n:"Srđan Babic",pos:["RB","CB"],r:72},
  {n:"Nikola Milenkovic",pos:["CB"],r:80},
  {n:"Milos Veljkovic",pos:["CB"],r:75},
  {n:"Strahinja Erakovic",pos:["CB"],r:73},
  {n:"Strahinja Pavlovic",pos:["CB"],r:75},
  {n:"Stefan Mitrovic",pos:["CB","LB"],r:73},
  {n:"Filip Mladenovic",pos:["LB","LWB"],r:74},
  {n:"Darko Lazovic",pos:["LW","LB"],r:74},
  {n:"Nemanja Gudelj",pos:["CDM","CB"],r:77},
  {n:"Nemanja Maksimovic",pos:["CDM","CM"],r:75},
  {n:"Uroš Racic",pos:["CDM","CM"],r:74},
  {n:"Sasa Lukic",pos:["CM","CAM"],r:76},
  {n:"Ivan Ilic",pos:["CM","CDM"],r:74},
  {n:"Marko Grujic",pos:["CM","CDM"],r:75},
  {n:"Sergej Milinkovic-Savic",pos:["CM","CAM"],r:86},
  {n:"Dusan Tadic",pos:["LW","CAM","RW"],r:83},
  {n:"Filip Kostic",pos:["LW","LB"],r:82},
  {n:"Andrija Zivkovic",pos:["LW","RW"],r:74},
  {n:"Nemanja Radonjic",pos:["LW","ST"],r:73},
  {n:"Filip Duricic",pos:["CAM","LW"],r:74},
  {n:"Luka Jovic",pos:["ST","CAM"],r:79},
  {n:"Dušan Vlahovic",pos:["ST"],r:84},
  {n:"Aleksandar Mitrovic",pos:["ST"],r:84}
 ]}],

 "South_Africa_2026":[{y:2026,p:[
  {n:"Ronwen Williams",pos:["GK"],r:78},{n:"Ricardo Goss",pos:["GK"],r:73},{n:"Sipho Chaine",pos:["GK"],r:72},
  {n:"Khuliso Mudau",pos:["RB","RWB"],r:76},{n:"Thapelo Maseko",pos:["RB","RWB"],r:74},
  {n:"Nkosinathi Sibisi",pos:["CB"],r:76},{n:"Sphephelo Sithole",pos:["CB"],r:74},
  {n:"Bradley Cross",pos:["CB","LB"],r:73},{n:"Mbekezeli Mbokazi",pos:["CB"],r:71},
  {n:"Aubrey Modiba",pos:["LB","LWB"],r:74},{n:"Olwethu Makhanya",pos:["LB"],r:71},
  {n:"Teboho Mokoena",pos:["CM","CDM"],r:79},{n:"Thalente Mbatha",pos:["CDM","CM"],r:76},
  {n:"Jayden Adams",pos:["CM","CDM"],r:75},{n:"Samukele Kabini",pos:["CM"],r:72},
  {n:"Kamogelo Sebelebele",pos:["CM","CAM"],r:72},{n:"Thabang Matuludi",pos:["CM","LW"],r:71},
  {n:"Oswin Appollis",pos:["LW","RW"],r:78},{n:"Relebohile Mofokeng",pos:["LW","CAM"],r:77},
  {n:"Themba Zwane",pos:["LW","CAM"],r:76},{n:"Khulumani Ndamane",pos:["RW","LW"],r:74},
  {n:"Iqraam Rayners",pos:["ST","LW"],r:76},{n:"Evidence Makgopa",pos:["ST"],r:77},
  {n:"Lyle Foster",pos:["ST","LW"],r:77},{n:"Ime Okon",pos:["ST"],r:72},
  {n:"Tshepang Moremi",pos:["LB","CDM"],r:70}
 ]}],

 "Switzerland_2018":[{y:2018,p:[
  {n:"Yann Sommer",pos:["GK"],r:83},
  {n:"Roman Burki",pos:["GK"],r:80},
  {n:"Yvon Mvogo",pos:["GK"],r:73},
  {n:"Stephan Lichtsteiner",pos:["RB","RWB"],r:79},
  {n:"Michael Lang",pos:["RB","CB"],r:75},
  {n:"Fabian Schar",pos:["CB","CDM"],r:80},
  {n:"Johan Djourou",pos:["CB"],r:76},
  {n:"Manuel Akanji",pos:["CB"],r:79},
  {n:"Nico Elvedi",pos:["CB"],r:78},
  {n:"Ricardo Rodriguez",pos:["LB","LWB"],r:79},
  {n:"Francois Moubandje",pos:["LB","LWB"],r:72},
  {n:"Valon Behrami",pos:["CDM","CM"],r:77},
  {n:"Gelson Fernandes",pos:["CDM","CM"],r:75},
  {n:"Denis Zakaria",pos:["CDM","CM"],r:78},
  {n:"Granit Xhaka",pos:["CM","CDM"],r:83},
  {n:"Blerim Dzemaili",pos:["CM","CAM"],r:76},
  {n:"Remo Freuler",pos:["CM","CDM"],r:78},
  {n:"Steven Zuber",pos:["LW","CM"],r:76},
  {n:"Xherdan Shaqiri",pos:["RW","CAM","LW"],r:82},
  {n:"Breel Embolo",pos:["ST","LW"],r:76},
  {n:"Haris Seferovic",pos:["ST","LW"],r:76},
  {n:"Josip Drmic",pos:["ST","LW"],r:73},
  {n:"Mario Gavranovic",pos:["ST"],r:73}
 ]}],

 "Switzerland_2022":[{y:2022,p:[
  {n:"Yann Sommer",pos:["GK"],r:86},
  {n:"Gregor Kobel",pos:["GK"],r:83},
  {n:"Jonas Omlin",pos:["GK"],r:77},
  {n:"Silvan Widmer",pos:["RB","RWB"],r:77},
  {n:"Fabian Schar",pos:["CB","CDM"],r:82},
  {n:"Manuel Akanji",pos:["CB"],r:84},
  {n:"Nico Elvedi",pos:["CB"],r:79},
  {n:"Eray Comert",pos:["CB","RB"],r:74},
  {n:"Ricardo Rodriguez",pos:["LB","LWB"],r:79},
  {n:"Michel Aebischer",pos:["CM","CDM"],r:75},
  {n:"Granit Xhaka",pos:["CM","CDM"],r:85},
  {n:"Denis Zakaria",pos:["CDM","CM"],r:81},
  {n:"Remo Freuler",pos:["CM","CDM"],r:80},
  {n:"Djibril Sow",pos:["CM","CDM"],r:78},
  {n:"Fabian Frei",pos:["CM","CAM"],r:73},
  {n:"Edimilson Fernandes",pos:["CM","CDM"],r:73},
  {n:"Ardon Jashari",pos:["CDM","CM"],r:72},
  {n:"Christian Fassnacht",pos:["RW","CM"],r:75},
  {n:"Renato Steffen",pos:["LW","RW"],r:74},
  {n:"Fabian Rieder",pos:["CM","LW"],r:74},
  {n:"Xherdan Shaqiri",pos:["RW","CAM","LW"],r:81},
  {n:"Ruben Vargas",pos:["LW","RW"],r:76},
  {n:"Noah Okafor",pos:["ST","LW"],r:77},
  {n:"Haris Seferovic",pos:["ST","LW"],r:76},
  {n:"Breel Embolo",pos:["ST","LW"],r:78},
  {n:"Zeki Amdouni",pos:["ST","LW"],r:74}
 ]}],

 "Switzerland_2026":[{y:2026,p:[
  {n:"Gregor Kobel",pos:["GK"],r:85},{n:"Yvon Mvogo",pos:["GK"],r:76},{n:"Marvin Keller",pos:["GK"],r:71},
  {n:"Silvan Widmer",pos:["RB","RWB"],r:78},{n:"Fabian Schar",pos:["CB","CDM"],r:82},
  {n:"Manuel Akanji",pos:["CB"],r:86},{n:"Nico Elvedi",pos:["CB"],r:81},
  {n:"Aurele Amenda",pos:["CB","LB"],r:75},{n:"Eray Comert",pos:["CB","RB"],r:76},
  {n:"Ricardo Rodriguez",pos:["LB","LWB"],r:78},{n:"Luca Jaquez",pos:["LB","CB"],r:73},
  {n:"Miro Muheim",pos:["LB","LWB"],r:73},{n:"Granit Xhaka",pos:["CM","CDM"],r:86},
  {n:"Remo Freuler",pos:["CM","CDM"],r:81},{n:"Denis Zakaria",pos:["CDM","CM"],r:81},
  {n:"Djibril Sow",pos:["CM","CDM"],r:79},{n:"Ardon Jashari",pos:["CDM","CM"],r:76},
  {n:"Michel Aebischer",pos:["CM","CDM"],r:77},{n:"Fabian Rieder",pos:["CM","LW"],r:76},
  {n:"Christian Fassnacht",pos:["RW","CM"],r:76},{n:"Xherdan Shaqiri",pos:["RW","CAM","LW"],r:80},
  {n:"Ruben Vargas",pos:["LW","RW"],r:79},{n:"Dan Ndoye",pos:["RW","LW"],r:79},
  {n:"Noah Okafor",pos:["ST","LW"],r:80},{n:"Breel Embolo",pos:["ST","LW"],r:80},
  {n:"Zeki Amdouni",pos:["ST","LW"],r:77},{n:"Cedric Itten",pos:["ST"],r:74}
 ]}],

 "Tunisia_2018":[{y:2018,p:[
  {n:"Aymen Mathlouthi",pos:["GK"],r:75},
  {n:"Farouk Ben Mustapha",pos:["GK"],r:73},
  {n:"Mouez Hassen",pos:["GK"],r:73},
  {n:"Hamdi Nagguez",pos:["RB","CB"],r:73},
  {n:"Syam Ben Youssef",pos:["CB"],r:76},
  {n:"Dylan Bronn",pos:["CB"],r:74},
  {n:"Yohan Benalouane",pos:["CB"],r:73},
  {n:"Yassine Meriah",pos:["CB","RB"],r:73},
  {n:"Ali Maaloul",pos:["LB","LWB"],r:77},
  {n:"Oussama Haddadi",pos:["LB"],r:72},
  {n:"Ellyes Skhiri",pos:["CDM","CM"],r:76},
  {n:"Mohamed Amine Ben Amor",pos:["CDM","CM"],r:73},
  {n:"Ferjani Sassi",pos:["CM","CDM"],r:76},
  {n:"Ghailene Chaalali",pos:["CM","CAM"],r:73},
  {n:"Rami Bedoui",pos:["CM"],r:70},
  {n:"Wahbi Khazri",pos:["CAM","ST","LW"],r:78},
  {n:"Naim Sliti",pos:["LW","CAM"],r:73},
  {n:"Bassem Srarfi",pos:["LW","RW"],r:72},
  {n:"Ahmed Khalil",pos:["CM","RW"],r:71},
  {n:"Saif-Eddine Khaoui",pos:["LW","CM"],r:72},
  {n:"Anice Badri",pos:["ST","LW"],r:72},
  {n:"Fakhreddine Ben Youssef",pos:["ST"],r:73},
  {n:"Saber Khalifa",pos:["ST"],r:70}
 ]}],

 "Tunisia_2022":[{y:2022,p:[
  {n:"Aymen Mathlouthi",pos:["GK"],r:74},
  {n:"Aymen Dahmen",pos:["GK"],r:76},
  {n:"Bechir Ben Said",pos:["GK"],r:71},
  {n:"Wajdi Kechrida",pos:["RB","CB"],r:74},
  {n:"Mohamed Drager",pos:["RB","CB"],r:74},
  {n:"Montassar Talbi",pos:["CB"],r:76},
  {n:"Nader Ghandri",pos:["CB"],r:74},
  {n:"Dylan Bronn",pos:["CB"],r:75},
  {n:"Bilel Ifa",pos:["CB"],r:72},
  {n:"Ali Maaloul",pos:["LB","LWB"],r:76},
  {n:"Ali Abdi",pos:["LB","CM"],r:72},
  {n:"Aissa Laidouni",pos:["CDM","CM"],r:75},
  {n:"Ellyes Skhiri",pos:["CDM","CM"],r:78},
  {n:"Ferjani Sassi",pos:["CM","CDM"],r:76},
  {n:"Hannibal Mejbri",pos:["CM","CAM"],r:73},
  {n:"Ghailene Chaalali",pos:["CM","CAM"],r:73},
  {n:"Mohamed Ali Ben Romdhane",pos:["CM","LW"],r:72},
  {n:"Naim Sliti",pos:["LW","CAM"],r:73},
  {n:"Anis Ben Slimane",pos:["CAM","LW"],r:74},
  {n:"Mouez Hassen",pos:["GK"],r:70},
  {n:"Wahbi Khazri",pos:["CAM","ST","LW"],r:77},
  {n:"Youssef Msakni",pos:["LW","CAM"],r:75},
  {n:"Issam Jebali",pos:["ST","LW"],r:75},
  {n:"Seifeddine Jaziri",pos:["ST"],r:73},
  {n:"Taha Yassine Khenissi",pos:["ST"],r:73}
 ]}],

 "Tunisia_2026":[{y:2026,p:[
  {n:"Aymen Dahmen",pos:["GK"],r:77},{n:"Mouhib Chamakh",pos:["GK"],r:71},{n:"Firas Chaouat",pos:["GK"],r:70},
  {n:"Wajdi Kechrida",pos:["RB","CB"],r:74},{n:"Montassar Talbi",pos:["CB"],r:77},
  {n:"Dylan Bronn",pos:["CB"],r:75},{n:"Omar Rekik",pos:["CB","LB"],r:74},
  {n:"Hazem Mastouri",pos:["CB"],r:72},{n:"Khalil Ayari",pos:["LB","LWB"],r:73},
  {n:"Ali Abdi",pos:["LB","CM"],r:73},{n:"Yan Valery",pos:["RB","RWB"],r:73},
  {n:"Ellyes Skhiri",pos:["CDM","CM"],r:79},{n:"Aissa Laidouni",pos:["CDM","CM"],r:76},
  {n:"Rani Khedira",pos:["CDM","CM"],r:75},{n:"Elias Achouri",pos:["CM","CDM"],r:72},
  {n:"Hannibal Mejbri",pos:["CM","CAM"],r:77},{n:"Mohamed Amine Ben Hamida",pos:["CM","CDM"],r:72},
  {n:"Anis Ben Slimane",pos:["CAM","LW"],r:76},{n:"Ismaël Gharbi",pos:["CAM","LW"],r:74},
  {n:"Elias Saad",pos:["LW","RW"],r:71},{n:"Mortadha Ben Ouanes",pos:["LW","CAM"],r:73},
  {n:"Sebastian Tounekti",pos:["LW","ST"],r:72},{n:"Moutaz Neffati",pos:["LW","ST"],r:70},
  {n:"Rayan Elloumi",pos:["ST","LW"],r:71},{n:"Hadj Mahmoud",pos:["ST"],r:73}
 ]}],

 "United_States_2022":[{y:2022,p:[
  {n:"Matt Turner",pos:["GK"],r:77},
  {n:"Sean Johnson",pos:["GK"],r:74},
  {n:"Ethan Horvath",pos:["GK"],r:73},
  {n:"Sergino Dest",pos:["RB","RWB","LB"],r:78},
  {n:"DeAndre Yedlin",pos:["RB","RWB"],r:75},
  {n:"Joe Scally",pos:["RB","CB"],r:73},
  {n:"Cameron Carter-Vickers",pos:["CB"],r:77},
  {n:"Walker Zimmerman",pos:["CB"],r:76},
  {n:"Aaron Long",pos:["CB"],r:75},
  {n:"Shaq Moore",pos:["LB","RB"],r:72},
  {n:"Tim Ream",pos:["CB","LB"],r:74},
  {n:"Antonee Robinson",pos:["LB","LWB"],r:78},
  {n:"Tyler Adams",pos:["CDM","CM"],r:82},
  {n:"Kellyn Acosta",pos:["CDM","CM"],r:74},
  {n:"Weston McKennie",pos:["CM","CDM"],r:80},
  {n:"Cristian Roldan",pos:["CM","CDM"],r:73},
  {n:"Luca de la Torre",pos:["CM","CAM"],r:73},
  {n:"Yunus Musah",pos:["CM","CAM"],r:78},
  {n:"Giovanni Reyna",pos:["CAM","LW","CM"],r:78},
  {n:"Brenden Aaronson",pos:["CAM","LW"],r:78},
  {n:"Timothy Weah",pos:["RW","ST"],r:75},
  {n:"Christian Pulisic",pos:["LW","CAM","RW"],r:84},
  {n:"Jordan Morris",pos:["LW","ST"],r:74},
  {n:"Jesús Ferreira",pos:["ST"],r:74},
  {n:"Josh Sargent",pos:["ST","LW"],r:75},
  {n:"Haji Wright",pos:["ST"],r:73}
 ]}],

 "United_States_2026":[{y:2026,p:[
  {n:"Matt Turner",pos:["GK"],r:78},{n:"Matt Freese",pos:["GK"],r:74},{n:"Chris Brady",pos:["GK"],r:73},
  {n:"Sergino Dest",pos:["RB","RWB","LB"],r:78},{n:"Joe Scally",pos:["RB","CB"],r:76},
  {n:"Chris Richards",pos:["CB"],r:78},{n:"Mark McKenzie",pos:["CB"],r:76},
  {n:"Auston Trusty",pos:["CB"],r:75},{n:"Tim Ream",pos:["CB","LB"],r:74},
  {n:"Miles Robinson",pos:["CB"],r:76},{n:"Antonee Robinson",pos:["LB","LWB"],r:80},
  {n:"Maximilian Arfsten",pos:["LB","LWB"],r:70},{n:"Tyler Adams",pos:["CDM","CM"],r:83},
  {n:"Weston McKennie",pos:["CM","CDM"],r:81},{n:"Yunus Musah",pos:["CM","CAM"],r:81},
  {n:"Sebastian Berhalter",pos:["CM","CDM"],r:72},{n:"Cristian Roldan",pos:["CM","CDM"],r:73},
  {n:"Christian Pulisic",pos:["LW","CAM","RW"],r:87},{n:"Brenden Aaronson",pos:["CAM","LW"],r:79},
  {n:"Giovanni Reyna",pos:["CAM","LW","CM"],r:80},{n:"Timothy Weah",pos:["RW","ST"],r:77},
  {n:"Alejandro Zendejas",pos:["LW","RW"],r:74},{n:"Malik Tillman",pos:["CAM","LW"],r:77},
  {n:"Folarin Balogun",pos:["ST"],r:79},{n:"Haji Wright",pos:["ST"],r:76},
  {n:"Ricardo Pepi",pos:["ST"],r:78},{n:"Alex Freeman",pos:["CM"],r:70}
 ]}],

 "Uzbekistan_2026":[{y:2026,p:[
  {n:"Farrukh Sayfiev",pos:["GK"],r:71},{n:"Abdukodir Khusanov",pos:["GK"],r:74},{n:"Igor Sergeev",pos:["GK"],r:69},
  {n:"Rustam Ashurmatov",pos:["RB","CB"],r:74},{n:"Otabek Shukurov",pos:["CB"],r:73},
  {n:"Akmal Mozgovoy",pos:["CB","LB"],r:73},{n:"Avazbek Ulmasaliev",pos:["LB","LWB"],r:71},
  {n:"Sherzod Nasrullaev",pos:["LB","RB"],r:71},{n:"Bekhruz Karimov",pos:["RB","CB"],r:72},
  {n:"Jakhongir Urozov",pos:["CDM","CM"],r:73},{n:"Oston Urunov",pos:["CM","CDM"],r:76},
  {n:"Abbosbek Fayzullaev",pos:["CM","RW"],r:78},{n:"Jamshid Iskanderov",pos:["CM","CAM"],r:72},
  {n:"Azizjon Ganiev",pos:["CM","CDM"],r:72},{n:"Utkir Yusupov",pos:["CM"],r:71},
  {n:"Dostonbek Khamdamov",pos:["CM","LW"],r:72},{n:"Sherzod Esanov",pos:["LW","RW"],r:70},
  {n:"Khojiakbar Alijonov",pos:["LW","RW"],r:71},{n:"Jaloliddin Masharipov",pos:["LW","CAM"],r:75},
  {n:"Odiljon Hamrobekov",pos:["LW","RW"],r:71},{n:"Farrukh Sayfiev",pos:["LW"],r:70},
  {n:"Umar Eshmurodov",pos:["ST","LW"],r:73},{n:"Abduvohid Nematov",pos:["ST"],r:72},
  {n:"Azizbek Amonov",pos:["ST"],r:71},{n:"Eldor Shomurodov",pos:["ST","LW"],r:79},
  {n:"Abdulla Abdullaev",pos:["CM","CDM"],r:70}
 ]}],

 "Wales_2022":[{y:2022,p:[
  {n:"Wayne Hennessey",pos:["GK"],r:76},
  {n:"Danny Ward",pos:["GK"],r:74},
  {n:"Adam Davies",pos:["GK"],r:72},
  {n:"Connor Roberts",pos:["RB","RWB"],r:76},
  {n:"Chris Gunter",pos:["RB","CB"],r:73},
  {n:"Chris Mepham",pos:["CB"],r:74},
  {n:"Ben Cabango",pos:["CB"],r:73},
  {n:"Joe Rodon",pos:["CB"],r:77},
  {n:"Tom Lockyer",pos:["CB"],r:73},
  {n:"Neco Williams",pos:["LB","RB"],r:74},
  {n:"Ben Davies",pos:["LB","CB"],r:78},
  {n:"Joe Allen",pos:["CDM","CM"],r:77},
  {n:"Ethan Ampadu",pos:["CDM","CM","CB"],r:76},
  {n:"Joe Morrell",pos:["CM","CDM"],r:73},
  {n:"Dylan Levitt",pos:["CM","CDM"],r:72},
  {n:"Matthew Smith",pos:["CM"],r:70},
  {n:"Aaron Ramsey",pos:["CAM","CM"],r:79},
  {n:"Harry Wilson",pos:["CAM","RW","LW"],r:77},
  {n:"Daniel James",pos:["LW","RW","ST"],r:77},
  {n:"Jonny Williams",pos:["LW","CM"],r:72},
  {n:"Sorba Thomas",pos:["RW","LW"],r:73},
  {n:"Brennan Johnson",pos:["RW","LW","ST"],r:79},
  {n:"Mark Harris",pos:["ST","LW"],r:71},
  {n:"Rubin Colwill",pos:["CAM","LW"],r:72},
  {n:"Kieffer Moore",pos:["ST"],r:76},
  {n:"Gareth Bale",pos:["RW","LW","ST"],r:87}
 ]}],

 "Iran_2018":[{y:2018,p:[
  {n:"Alireza Beiranvand",pos:["GK"],r:78},
  {n:"Amir Abedzadeh",pos:["GK"],r:74},
  {n:"Pejman Montazeri",pos:["GK"],r:72},
  {n:"Ramin Rezaeian",pos:["RB","RWB"],r:73},
  {n:"Morteza Pouraliganji",pos:["CB"],r:76},
  {n:"Majid Hosseini",pos:["CB"],r:74},
  {n:"Mohammad Reza Khanzadeh",pos:["CB","LB"],r:71},
  {n:"Ehsan Hajsafi",pos:["LB","LWB"],r:75},
  {n:"Milad Mohammadi",pos:["LB","LWB"],r:72},
  {n:"Rouzbeh Cheshmi",pos:["CB","CDM"],r:71},
  {n:"Masoud Shojaei",pos:["CM","CDM"],r:77},
  {n:"Omid Ebrahimi",pos:["CDM","CM"],r:75},
  {n:"Saeid Ezatolahi",pos:["CM","CDM"],r:74},
  {n:"Mohammad Rashid Mazaheri",pos:["CM"],r:69},
  {n:"Mehdi Torabi",pos:["LW","CM"],r:72},
  {n:"Alireza Jahanbakhsh",pos:["RW","LW","ST"],r:78},
  {n:"Ashkan Dejagah",pos:["LW","CAM"],r:74},
  {n:"Saman Ghoddos",pos:["LW","CAM"],r:73},
  {n:"Vahid Amiri",pos:["RW","LW"],r:73},
  {n:"Sardar Azmoun",pos:["ST","LW"],r:80},
  {n:"Mehdi Taremi",pos:["ST","LW"],r:78},
  {n:"Karim Ansarifard",pos:["ST"],r:74},
  {n:"Reza Ghoochannejhad",pos:["ST"],r:73}
 ]}],

 "Iran_2022":[{y:2022,p:[
  {n:"Alireza Beiranvand",pos:["GK"],r:79},
  {n:"Amir Abedzadeh",pos:["GK"],r:73},
  {n:"Hossein Hosseini",pos:["GK"],r:72},
  {n:"Ramin Rezaeian",pos:["RB","RWB"],r:73},
  {n:"Sadegh Moharrami",pos:["RB","CB"],r:73},
  {n:"Morteza Pouraliganji",pos:["CB"],r:76},
  {n:"Majid Hosseini",pos:["CB"],r:76},
  {n:"Shojae Khalilzadeh",pos:["CB","LB"],r:74},
  {n:"Hossein Kanaanizadegan",pos:["CB"],r:72},
  {n:"Ehsan Hajsafi",pos:["LB","LWB"],r:75},
  {n:"Milad Mohammadi",pos:["LB","LWB"],r:72},
  {n:"Rouzbeh Cheshmi",pos:["CM","CDM"],r:73},
  {n:"Saeid Ezatolahi",pos:["CM","CDM"],r:75},
  {n:"Ahmad Nourollahi",pos:["CDM","CM"],r:73},
  {n:"Ali Karimi",pos:["CM","CAM"],r:72},
  {n:"Abolfazl Jalali",pos:["CM","CDM"],r:70},
  {n:"Vahid Amiri",pos:["LW","RW"],r:73},
  {n:"Alireza Jahanbakhsh",pos:["RW","LW","ST"],r:79},
  {n:"Ali Gholizadeh",pos:["LW","RW"],r:74},
  {n:"Saman Ghoddos",pos:["LW","CAM"],r:74},
  {n:"Mehdi Torabi",pos:["LW","CM"],r:73},
  {n:"Karim Ansarifard",pos:["ST"],r:74},
  {n:"Payam Niazmand",pos:["ST"],r:70},
  {n:"Sardar Azmoun",pos:["ST","LW"],r:82},
  {n:"Mehdi Taremi",pos:["ST","LW"],r:84}
 ]}],

 "Iran_2026":[{y:2026,p:[
  {n:"Alireza Beiranvand",pos:["GK"],r:79},{n:"Hossein Hosseini",pos:["GK"],r:74},{n:"Payam Niazmand",pos:["GK"],r:72},
  {n:"Ramin Rezaeian",pos:["RB","RWB"],r:72},{n:"Amirhossein Hosseinzadeh",pos:["RB","CB"],r:72},
  {n:"Shojae Khalilzadeh",pos:["CB"],r:75},{n:"Hossein Kanaanizadegan",pos:["CB"],r:73},
  {n:"Morteza Pouraliganji",pos:["CB"],r:75},{n:"Ali Nemati",pos:["CB","LB"],r:71},
  {n:"Ehsan Hajsafi",pos:["LB","LWB"],r:74},{n:"Milad Mohammadi",pos:["LB","LWB"],r:72},
  {n:"Saeid Ezatolahi",pos:["CM","CDM"],r:76},{n:"Rouzbeh Cheshmi",pos:["CM","CDM"],r:74},
  {n:"Mohammad Ghorbani",pos:["CDM","CM"],r:71},{n:"Danial Eiri",pos:["CM","CAM"],r:71},
  {n:"Amirmohammad Razzaghinia",pos:["CM","LW"],r:71},{n:"Aria Yousefi",pos:["LW","RW"],r:72},
  {n:"Alireza Jahanbakhsh",pos:["RW","LW","ST"],r:77},{n:"Saman Ghoddos",pos:["LW","CAM"],r:74},
  {n:"Ali Alipour",pos:["ST","LW"],r:73},{n:"Dennis Eckert",pos:["ST"],r:74},
  {n:"Mehdi Ghayedi",pos:["LW","CAM"],r:73},{n:"Mehdi Taremi",pos:["ST","LW"],r:85},
  {n:"Shahriyar Moghanlou",pos:["GK"],r:70},{n:"Saleh Hardani",pos:["CM","CDM"],r:70},
  {n:"Mohammad Mohebi",pos:["CM"],r:70}
 ]}],

 "Germany_2018":[{y:2018,p:[
  {n:"Manuel Neuer",pos:["GK"],r:91},{n:"Marc-Andre ter Stegen",pos:["GK"],r:84},{n:"Kevin Trapp",pos:["GK"],r:77},
  {n:"Joshua Kimmich",pos:["RB","CDM","CM"],r:85},{n:"Matthias Ginter",pos:["CB","RB"],r:78},
  {n:"Jerome Boateng",pos:["CB","RB"],r:84},{n:"Mats Hummels",pos:["CB"],r:86},
  {n:"Niklas Sule",pos:["CB"],r:80},{n:"Jonas Hector",pos:["LB","LWB"],r:78},
  {n:"Marvin Plattenhardt",pos:["LB","LWB"],r:75},{n:"Antonio Rudiger",pos:["CB","LB"],r:80},
  {n:"Toni Kroos",pos:["CM","CDM"],r:88},{n:"Sami Khedira",pos:["CM","CDM"],r:81},
  {n:"Ilkay Gundogan",pos:["CM","CAM","CDM"],r:83},{n:"Sebastian Rudy",pos:["CM","CDM"],r:76},
  {n:"Leon Goretzka",pos:["CM","CDM"],r:80},{n:"Julian Brandt",pos:["CAM","LW","CM"],r:78},
  {n:"Mesut Ozil",pos:["CAM","CM"],r:85},{n:"Thomas Muller",pos:["CAM","RW","ST"],r:87},
  {n:"Marco Reus",pos:["LW","CAM"],r:83},{n:"Julian Draxler",pos:["CAM","LW"],r:79},
  {n:"Leroy Sane",pos:["LW","RW"],r:84},{n:"Serge Gnabry",pos:["RW","LW"],r:79},
  {n:"Timo Werner",pos:["ST","LW"],r:80},{n:"Mario Gomez",pos:["ST"],r:77}
 ]}],

 "Algeria_2010":[{y:2010,p:[
  {n:"Raïs M'Bolhi",pos:["GK"],r:77},{n:"Faouzi Chaouchi",pos:["GK"],r:74},{n:"Lounès Gaouaoui",pos:["GK"],r:70},
  {n:"Rafik Halliche",pos:["CB"],r:74},{n:"Madjid Bougherra",pos:["CB"],r:78},
  {n:"Antar Yahia",pos:["CB","CDM"],r:74},{n:"Carl Medjani",pos:["CM","CDM"],r:73},
  {n:"Nadir Belhadj",pos:["LB","LWB"],r:74},{n:"Habib Bellaïd",pos:["CB"],r:70},
  {n:"Djamel Mesbah",pos:["LB","CB"],r:72},{n:"Yazid Mansouri",pos:["CDM","CM"],r:75},
  {n:"Mehdi Lacen",pos:["CDM","CM"],r:74},{n:"Adlène Guedioura",pos:["CM","CDM"],r:74},
  {n:"Hassan Yebda",pos:["CM","CDM"],r:73},{n:"Karim Ziani",pos:["CM","CAM"],r:74},
  {n:"Abdelkader Laïfaoui",pos:["CM"],r:69},{n:"Karim Matmour",pos:["LW","RW"],r:72},
  {n:"Ryad Boudebouz",pos:["CM","LW"],r:73},{n:"Djamel Abdoun",pos:["LW","CAM"],r:72},
  {n:"Foued Kadir",pos:["LW","CAM"],r:72},{n:"Rafik Saïfi",pos:["LW","ST"],r:72},
  {n:"Abdelkader Ghezzal",pos:["ST","LW"],r:72},{n:"Rafik Djebbour",pos:["ST"],r:73}
 ]}],

 "Algeria_2014":[{y:2014,p:[
  {n:"Raïs M'Bolhi",pos:["GK"],r:78},{n:"Mohamed Zemmamouche",pos:["GK"],r:73},{n:"Azzedine Doukha",pos:["GK"],r:70},
  {n:"Rafik Halliche",pos:["CB"],r:74},{n:"Madjid Bougherra",pos:["CB"],r:77},
  {n:"Essaïd Belkalem",pos:["CB"],r:73},{n:"Liassine Cadamuro-Bentaïba",pos:["CB","LB"],r:73},
  {n:"Faouzi Ghoulam",pos:["LB","LWB"],r:78},{n:"Djamel Mesbah",pos:["LB","CB"],r:71},
  {n:"Aïssa Mandi",pos:["CB","CDM"],r:73},{n:"Mehdi Lacen",pos:["CDM","CM"],r:74},
  {n:"Carl Medjani",pos:["CM","CDM"],r:73},{n:"Mehdi Mostefa",pos:["CM","CDM"],r:71},
  {n:"Hassan Yebda",pos:["CM","CDM"],r:72},{n:"Adlène Guedioura",pos:["CM","CDM"],r:73},
  {n:"Saphir Taïder",pos:["CM","CAM"],r:74},{n:"Cédric Si Mohamed",pos:["CM"],r:70},
  {n:"Hillal Soudani",pos:["LW","ST"],r:73},{n:"Nabil Ghilas",pos:["LW","ST"],r:71},
  {n:"Islam Slimani",pos:["ST","LW"],r:78},{n:"Abdelmoumene Djabou",pos:["ST","LW"],r:72},
  {n:"Sofiane Feghouli",pos:["LW","CAM"],r:78},{n:"Yacine Brahimi",pos:["LW","RW"],r:79},
  {n:"Riyad Mahrez",pos:["RW","LW","CAM"],r:79}
 ]}],

 "Angola_2006":[{y:2006,p:[
  {n:"João Ricardo",pos:["GK"],r:72},{n:"Marco Airosa",pos:["GK"],r:70},{n:"Lama",pos:["GK"],r:70},
  {n:"Jamba",pos:["CB","RB"],r:70},{n:"Rui Marques",pos:["CB"],r:73},{n:"Marco Abreu",pos:["CB"],r:70},
  {n:"Kali",pos:["CB","LB"],r:71},{n:"Marco Aurélio",pos:["LB","CB"],r:70},{n:"Miloy",pos:["RB"],r:69},
  {n:"Edson Nobre",pos:["CDM","CM"],r:70},{n:"André Macanga",pos:["CM","CDM"],r:70},
  {n:"Mendonça",pos:["CM","CDM"],r:71},{n:"Flávio",pos:["CM","LW"],r:70},
  {n:"Paulo Figueiredo",pos:["CM"],r:69},{n:"Mário Hipólito",pos:["CM"],r:69},
  {n:"Locó",pos:["LW","RW"],r:71},{n:"Akwá",pos:["CAM","LW"],r:73},
  {n:"Lebo Lebo",pos:["LW","ST"],r:71},{n:"Delgado",pos:["RW","LW"],r:70},
  {n:"Titi Buengo",pos:["CM","LW"],r:69},{n:"Zé Kalanga",pos:["ST"],r:70},
  {n:"Love",pos:["ST","LW"],r:71},{n:"Mantorras",pos:["ST"],r:74}
 ]}],

 "Australia_2006":[{y:2006,p:[
  {n:"Mark Schwarzer",pos:["GK"],r:81},{n:"Zeljko Kalac",pos:["GK"],r:76},{n:"Ante Covic",pos:["GK"],r:70},
  {n:"Lucas Neill",pos:["RB","CB"],r:78},{n:"Tony Popovic",pos:["CB"],r:76},
  {n:"Craig Moore",pos:["CB"],r:77},{n:"Michael Beauchamp",pos:["CB"],r:73},
  {n:"Stan Lazaridis",pos:["LB","LWB"],r:75},{n:"Mark Milligan",pos:["CDM","CB"],r:74},
  {n:"Luke Wilkshire",pos:["RB","RWB"],r:75},{n:"Josip Skoko",pos:["CM","CDM"],r:74},
  {n:"Vince Grella",pos:["CM","CDM"],r:74},{n:"Jason Culina",pos:["CM","CDM"],r:74},
  {n:"Scott Chipperfield",pos:["CM","LW"],r:73},{n:"Mile Sterjovski",pos:["RW","LW"],r:73},
  {n:"Brett Emerton",pos:["RW","LW"],r:76},{n:"Mark Bresciano",pos:["CM","CAM"],r:76},
  {n:"Harry Kewell",pos:["LW","CAM"],r:81},{n:"Archie Thompson",pos:["LW","ST"],r:71},
  {n:"Tim Cahill",pos:["CAM","ST"],r:79},{n:"Mark Viduka",pos:["ST"],r:80},
  {n:"John Aloisi",pos:["ST"],r:75},{n:"Joshua Kennedy",pos:["ST"],r:73}
 ]}],

 "Australia_2010":[{y:2010,p:[
  {n:"Mark Schwarzer",pos:["GK"],r:80},{n:"Eugene Galekovic",pos:["GK"],r:72},{n:"Adam Federici",pos:["GK"],r:74},
  {n:"Lucas Neill",pos:["RB","CB"],r:76},{n:"Craig Moore",pos:["CB"],r:75},
  {n:"Michael Beauchamp",pos:["CB"],r:72},{n:"Carl Valeri",pos:["CM","CDM"],r:73},
  {n:"Mark Milligan",pos:["CDM","CB"],r:75},{n:"Luke Wilkshire",pos:["RB","RWB"],r:75},
  {n:"Mile Jedinak",pos:["CDM","CM"],r:77},{n:"Vince Grella",pos:["CM","CDM"],r:73},
  {n:"Jason Culina",pos:["CM","CDM"],r:73},{n:"Scott Chipperfield",pos:["CM","LW"],r:72},
  {n:"Richard Garcia",pos:["CM","LW"],r:71},{n:"Brett Emerton",pos:["RW","LW"],r:74},
  {n:"Mark Bresciano",pos:["CM","CAM"],r:75},{n:"Dario Vidošić",pos:["LW","CM"],r:71},
  {n:"Harry Kewell",pos:["LW","CAM"],r:78},{n:"Nikita Rukavytsya",pos:["LW","ST"],r:72},
  {n:"David Carney",pos:["LW","LM"],r:71},{n:"Brett Holman",pos:["CAM","LW"],r:74},
  {n:"Joshua Kennedy",pos:["ST"],r:74},{n:"Tim Cahill",pos:["CAM","ST"],r:80}
 ]}],

 "Australia_2014":[{y:2014,p:[
  {n:"Mathew Ryan",pos:["GK"],r:75},{n:"Mitchell Langerak",pos:["GK"],r:74},{n:"Eugene Galekovic",pos:["GK"],r:71},
  {n:"Ivan Franjic",pos:["RB","CB"],r:73},{n:"Alex Wilkinson",pos:["CB"],r:73},
  {n:"Matthew Spiranovic",pos:["CB"],r:73},{n:"Bailey Wright",pos:["CB"],r:72},
  {n:"Jason Davidson",pos:["LB","LWB"],r:72},{n:"Ryan McGowan",pos:["RB","CB"],r:71},
  {n:"Mile Jedinak",pos:["CDM","CM"],r:78},{n:"Mark Milligan",pos:["CDM","CM"],r:75},
  {n:"Matt McKay",pos:["CM","CDM"],r:73},{n:"Oliver Bozanic",pos:["CM"],r:70},
  {n:"James Holland",pos:["CM","CDM"],r:72},{n:"Massimo Luongo",pos:["CM","CAM"],r:74},
  {n:"Dario Vidošić",pos:["LW","CM"],r:71},{n:"Ben Halloran",pos:["LW","CM"],r:70},
  {n:"Tommy Oar",pos:["LW","LM"],r:71},{n:"Mark Bresciano",pos:["CM","CAM"],r:73},
  {n:"Mathew Leckie",pos:["RW","LW"],r:74},{n:"James Troisi",pos:["LW","CAM"],r:72},
  {n:"Adam Taggart",pos:["ST"],r:72},{n:"Tim Cahill",pos:["CAM","ST"],r:79}
 ]}],

 "Bosnia_and_Herzegovina_2014":[{y:2014,p:[
  {n:"Asmir Begović",pos:["GK"],r:82},{n:"Jasmin Fejzić",pos:["GK"],r:72},{n:"Asmir Avdukić",pos:["GK"],r:70},
  {n:"Avdija Vršajević",pos:["RB","CB"],r:73},{n:"Emir Spahić",pos:["CB"],r:77},
  {n:"Toni Šunjić",pos:["CB"],r:73},{n:"Ermin Bičakčić",pos:["CB"],r:73},
  {n:"Mensur Mujdža",pos:["RB","CB"],r:72},{n:"Sead Kolašinac",pos:["LB","LWB"],r:76},
  {n:"Ognjen Vranješ",pos:["CDM","CB"],r:73},{n:"Muhamed Bešić",pos:["CDM","CM"],r:75},
  {n:"Haris Medunjanin",pos:["CM","CDM"],r:73},{n:"Sejad Salihović",pos:["CM","CDM"],r:73},
  {n:"Izet Hajrović",pos:["CM","CAM"],r:72},{n:"Anel Hadžić",pos:["LW","CM"],r:70},
  {n:"Tino-Sven Sušić",pos:["LW","CM"],r:71},{n:"Senad Lulić",pos:["LW","LM"],r:74},
  {n:"Senijad Ibričić",pos:["CAM","CM"],r:72},{n:"Edin Višća",pos:["LW","CAM"],r:74},
  {n:"Miralem Pjanić",pos:["CAM","CM"],r:84},{n:"Vedad Ibišević",pos:["ST"],r:76},
  {n:"Zvjezdan Misimović",pos:["CAM","CM"],r:75},{n:"Edin Džeko",pos:["ST"],r:84}
 ]}],

 "Chile_2010":[{y:2010,p:[
  {n:"Claudio Bravo",pos:["GK"],r:82},{n:"Miguel Pinto",pos:["GK"],r:73},{n:"Marco Estrada",pos:["GK"],r:70},
  {n:"Mauricio Isla",pos:["RB","RWB"],r:77},{n:"Gonzalo Jara",pos:["CB","RB"],r:74},
  {n:"Pablo Contreras",pos:["CB"],r:75},{n:"Ismael Fuentes",pos:["LB","CB"],r:72},
  {n:"Jean Beausejour",pos:["LB","LWB"],r:74},{n:"Waldo Ponce",pos:["CB"],r:72},
  {n:"Carlos Carmona",pos:["CDM","CM"],r:73},{n:"Gary Medel",pos:["CDM","CB"],r:80},
  {n:"Rodrigo Millar",pos:["CM","CDM"],r:72},{n:"Rodrigo Tello",pos:["LW","CM"],r:74},
  {n:"Gonzalo Fierro",pos:["CM","CDM"],r:71},{n:"Luis Marín",pos:["CM","LB"],r:70},
  {n:"Mark González",pos:["LW","RW"],r:74},{n:"Fabián Orellana",pos:["LW","RW"],r:77},
  {n:"Matías Fernández",pos:["CAM","LW"],r:76},{n:"Jorge Valdivia",pos:["CAM","CM"],r:79},
  {n:"Esteban Paredes",pos:["ST"],r:74},{n:"Humberto Suazo",pos:["ST"],r:77},
  {n:"Alexis Sánchez",pos:["LW","ST","RW"],r:85},{n:"Arturo Vidal",pos:["CM","CDM"],r:83}
 ]}],

 "Chile_2014":[{y:2014,p:[
  {n:"Claudio Bravo",pos:["GK"],r:84},{n:"Johnny Herrera",pos:["GK"],r:74},{n:"Cristopher Toselli",pos:["GK"],r:72},
  {n:"Mauricio Isla",pos:["RB","RWB"],r:78},{n:"Gonzalo Jara",pos:["CB","RB"],r:75},
  {n:"Gary Medel",pos:["CDM","CB"],r:82},{n:"José Manuel Rojas",pos:["LB","CB"],r:73},
  {n:"Eugenio Mena",pos:["LB","LWB"],r:73},{n:"José Pablo Fuenzalida",pos:["RB","CM"],r:73},
  {n:"Miiko Albornoz",pos:["LB"],r:71},{n:"Francisco Silva",pos:["CDM","CM"],r:72},
  {n:"Carlos Carmona",pos:["CDM","CM"],r:73},{n:"Marcelo Díaz",pos:["CM","CDM"],r:74},
  {n:"Jean Beausejour",pos:["LB","LW"],r:74},{n:"Charles Aránguiz",pos:["CM","CDM"],r:80},
  {n:"Felipe Gutiérrez",pos:["CM","LW"],r:72},{n:"Fabián Orellana",pos:["LW","RW"],r:77},
  {n:"Jorge Valdivia",pos:["CAM","CM"],r:78},{n:"Mauricio Pinilla",pos:["ST","LW"],r:73},
  {n:"Eduardo Vargas",pos:["ST","LW"],r:79},{n:"Esteban Paredes",pos:["ST"],r:73},
  {n:"Alexis Sánchez",pos:["LW","ST","RW"],r:88},{n:"Arturo Vidal",pos:["CM","CDM"],r:86}
 ]}],

 "Costa_Rica_2006":[{y:2006,p:[
  {n:"José Francisco Porras",pos:["GK"],r:75},{n:"Álvaro Mesén",pos:["GK"],r:71},{n:"Douglas Sequeira",pos:["GK"],r:70},
  {n:"Jervis Drummond",pos:["RB","CB"],r:72},{n:"Michael Umaña",pos:["CB"],r:74},
  {n:"Leonardo González",pos:["CB"],r:72},{n:"Gilberto Martínez",pos:["LB","CB"],r:71},
  {n:"Kurt Bernard",pos:["LB","LWB"],r:70},{n:"Harold Wallace",pos:["RB","CM"],r:70},
  {n:"Mauricio Solís",pos:["CDM","CM"],r:73},{n:"Walter Centeno",pos:["CM","CAM"],r:74},
  {n:"Randall Azofeifa",pos:["CM","CDM"],r:72},{n:"Rónald Gómez",pos:["CM","LW"],r:72},
  {n:"Danny Fonseca",pos:["CM","CDM"],r:70},{n:"Luis Marín",pos:["LB","CDM"],r:71},
  {n:"Carlos Hernández",pos:["CAM","CM"],r:74},{n:"Christian Bolaños",pos:["LW","RW"],r:73},
  {n:"Gabriel Badilla",pos:["CB","CDM"],r:70},{n:"Wardy Alfaro",pos:["LW","ST"],r:70},
  {n:"Víctor Núñez",pos:["LW","CAM"],r:70},{n:"Michael Rodríguez",pos:["LW","ST"],r:69},
  {n:"Álvaro Saborío",pos:["ST","LW"],r:76},{n:"Paulo Wanchope",pos:["ST"],r:77}
 ]}],

 "Costa_Rica_2014":[{y:2014,p:[
  {n:"Keylor Navas",pos:["GK"],r:85},{n:"Patrick Pemberton",pos:["GK"],r:72},{n:"Daniel Cambronero",pos:["GK"],r:70},
  {n:"Cristian Gamboa",pos:["RB","RWB"],r:73},{n:"Giancarlo González",pos:["CB"],r:77},
  {n:"Jhonny Acosta",pos:["CB"],r:73},{n:"Óscar Duarte",pos:["CB"],r:76},
  {n:"Michael Umaña",pos:["CB","LB"],r:72},{n:"Roy Miller",pos:["LB","CB"],r:72},
  {n:"Waylon Francis",pos:["LB","LWB"],r:71},{n:"Júnior Díaz",pos:["LB","CB"],r:71},
  {n:"Celso Borges",pos:["CM","CDM"],r:76},{n:"José Miguel Cubero",pos:["CDM","CM"],r:73},
  {n:"Michael Barrantes",pos:["CM","CDM"],r:72},{n:"David Myrie",pos:["LB","CM"],r:70},
  {n:"Diego Calvo",pos:["CM"],r:69},{n:"Randall Brenes",pos:["CAM","CM"],r:71},
  {n:"Christian Bolaños",pos:["LW","RW"],r:73},{n:"Yeltsin Tejeda",pos:["CDM","CM"],r:73},
  {n:"Óscar Granados",pos:["LW","ST"],r:70},{n:"Marco Ureña",pos:["ST","LW"],r:73},
  {n:"Bryan Ruiz",pos:["CAM","CM"],r:80},{n:"Joel Campbell",pos:["RW","ST","LW"],r:76}
 ]}],

 "Ecuador_2006":[{y:2006,p:[
  {n:"Édison Méndez",pos:["CAM","CM"],r:76},{n:"Edwin Villafuerte",pos:["GK"],r:70},{n:"Paúl Ambrosi",pos:["GK"],r:72},
  {n:"Iván Hurtado",pos:["CB"],r:78},{n:"Jorge Guagua",pos:["CB"],r:74},
  {n:"Giovanny Espinoza",pos:["CB","CDM"],r:74},{n:"Ulises de la Cruz",pos:["RB","RWB"],r:76},
  {n:"Marlon Ayoví",pos:["LB","LWB"],r:72},{n:"Edwin Tenorio",pos:["RB","CM"],r:74},
  {n:"Luis Saritama",pos:["CDM","CM"],r:73},{n:"Damián Lanza",pos:["CM","CDM"],r:71},
  {n:"Segundo Castillo",pos:["CM","CDM"],r:74},{n:"Néicer Reasco",pos:["CM","LW"],r:72},
  {n:"Patricio Urrutia",pos:["CM","CAM"],r:71},{n:"Cristian Mora",pos:["LW","CM"],r:71},
  {n:"Christian Benítez",pos:["LW","ST"],r:76},{n:"Christian Lara",pos:["LW","CM"],r:71},
  {n:"Antonio Valencia",pos:["RW","LW"],r:77},{n:"Félix Borja",pos:["ST"],r:71},
  {n:"Iván Kaviedes",pos:["ST","LW"],r:74},{n:"José Luis Perlaza",pos:["LW","ST"],r:70},
  {n:"Carlos Tenorio",pos:["ST"],r:74},{n:"Agustín Delgado",pos:["ST"],r:75}
 ]}],

 "Ecuador_2014":[{y:2014,p:[
  {n:"Máximo Banguera",pos:["GK"],r:73},{n:"Alexander Domínguez",pos:["GK"],r:74},{n:"Óscar Bagüí",pos:["GK"],r:70},
  {n:"Juan Carlos Paredes",pos:["RB","CB"],r:73},{n:"Jorge Guagua",pos:["CB"],r:73},
  {n:"Frickson Erazo",pos:["CB"],r:74},{n:"Gabriel Achilier",pos:["CB"],r:72},
  {n:"Walter Ayoví",pos:["LB","LWB"],r:72},{n:"Luis Saritama",pos:["CDM","CM"],r:72},
  {n:"Carlos Gruezo",pos:["CDM","CM"],r:72},{n:"Christian Noboa",pos:["CM","CDM"],r:73},
  {n:"Adrián Bone",pos:["CM","CDM"],r:71},{n:"Renato Ibarra",pos:["LW","CM"],r:73},
  {n:"Michael Arroyo",pos:["LW","CM"],r:72},{n:"Joao Rojas",pos:["CM","RW"],r:71},
  {n:"Oswaldo Minda",pos:["LW","CM"],r:70},{n:"Fidel Martínez",pos:["LW","RW"],r:71},
  {n:"Jefferson Montero",pos:["LW","LM"],r:74},{n:"Antonio Valencia",pos:["RW","LW"],r:81},
  {n:"Felipe Caicedo",pos:["ST","LW"],r:74},{n:"Jaime Ayoví",pos:["ST"],r:72},
  {n:"Édison Méndez",pos:["CAM","CM"],r:72},{n:"Enner Valencia",pos:["ST","LW"],r:79}
 ]}],

 "Greece_2010":[{y:2010,p:[
  {n:"Alexandros Tzorvas",pos:["GK"],r:74},{n:"Kostas Chalkias",pos:["GK"],r:74},{n:"Michalis Sifakis",pos:["GK"],r:72},
  {n:"Giourkas Seitaridis",pos:["RB","CB"],r:74},{n:"Avraam Papadopoulos",pos:["CB"],r:74},
  {n:"Sotirios Kyrgiakos",pos:["CB"],r:74},{n:"Loukas Vyntra",pos:["CB"],r:72},
  {n:"Nikos Spyropoulos",pos:["LB","CB"],r:72},{n:"Christos Patsatzoglou",pos:["LB"],r:70},
  {n:"Kostas Katsouranis",pos:["CDM","CM"],r:75},{n:"Alexandros Tziolis",pos:["CM","CDM"],r:72},
  {n:"Giorgos Karagounis",pos:["CM","CAM"],r:79},{n:"Stelios Malezas",pos:["CM"],r:70},
  {n:"Sakis Prittas",pos:["CM"],r:69},{n:"Vangelis Moras",pos:["CB","LB"],r:70},
  {n:"Vasilis Torosidis",pos:["RB","CM"],r:74},{n:"Sotiris Ninis",pos:["LW","CAM"],r:72},
  {n:"Sokratis Papastathopoulos",pos:["CB"],r:76},{n:"Pantelis Kapetanos",pos:["ST","LW"],r:71},
  {n:"Dimitris Salpingidis",pos:["LW","ST"],r:74},{n:"Theofanis Gekas",pos:["ST"],r:76},
  {n:"Angelos Charisteas",pos:["ST"],r:73},{n:"Georgios Samaras",pos:["ST","LW"],r:76}
 ]}],

 "Greece_2014":[{y:2014,p:[
  {n:"Orestis Karnezis",pos:["GK"],r:74},{n:"Panagiotis Glykos",pos:["GK"],r:73},{n:"Stefanos Kapino",pos:["GK"],r:72},
  {n:"Vasilis Torosidis",pos:["RB","CM"],r:74},{n:"Kostas Manolas",pos:["CB"],r:80},
  {n:"Sokratis Papastathopoulos",pos:["CB"],r:80},{n:"Vangelis Moras",pos:["CB"],r:70},
  {n:"Loukas Vyntra",pos:["LB","CB"],r:71},{n:"Giorgos Tzavellas",pos:["LB","CB"],r:72},
  {n:"José Holebas",pos:["LB","LWB"],r:73},{n:"Giannis Maniatis",pos:["CDM","CM"],r:72},
  {n:"Kostas Katsouranis",pos:["CM","CDM"],r:73},{n:"Alexandros Tziolis",pos:["CDM","CM"],r:71},
  {n:"Panagiotis Tachtsidis",pos:["CDM","CM"],r:74},{n:"Panagiotis Kone",pos:["CM","LW"],r:73},
  {n:"Andreas Samaris",pos:["CM","CDM"],r:74},{n:"Giannis Fetfatzidis",pos:["LW","RW"],r:72},
  {n:"Lazaros Christodoulopoulos",pos:["LW","CAM"],r:73},{n:"Giorgos Karagounis",pos:["CM","CAM"],r:77},
  {n:"Dimitris Salpingidis",pos:["LW","ST"],r:72},{n:"Theofanis Gekas",pos:["ST"],r:73},
  {n:"Kostas Mitroglou",pos:["ST"],r:77},{n:"Georgios Samaras",pos:["ST","LW"],r:74}
 ]}],

 "Honduras_2010":[{y:2010,p:[
  {n:"Noel Valladares",pos:["GK"],r:74},{n:"Donis Escober",pos:["GK"],r:70},{n:"Mauricio Sabillón",pos:["GK"],r:69},
  {n:"Maynor Figueroa",pos:["CB","LB"],r:75},{n:"Osman Chávez",pos:["CB"],r:73},
  {n:"Víctor Bernárdez",pos:["CB"],r:74},{n:"Danilo Turcios",pos:["RB","CB"],r:72},
  {n:"Emilio Izaguirre",pos:["LB","LWB"],r:75},{n:"Edgár Álvarez",pos:["LB","CB"],r:71},
  {n:"Amado Guevara",pos:["CDM","CM"],r:73},{n:"Wilson Palacios",pos:["CDM","CM"],r:77},
  {n:"Roger Espinoza",pos:["CM","CDM"],r:73},{n:"Hendry Thomas",pos:["CM","CDM"],r:73},
  {n:"Georgie Welcome",pos:["LW","CM"],r:70},{n:"Sergio Mendoza",pos:["CM"],r:70},
  {n:"Ramón Núñez",pos:["CM","RW"],r:72},{n:"Boniek García",pos:["CM","LW"],r:73},
  {n:"Jerry Palacios",pos:["LW","ST"],r:72},{n:"Johnny Palacios",pos:["LW","ST"],r:71},
  {n:"Ricardo Canales",pos:["LW","RW"],r:70},{n:"David Suazo",pos:["ST","LW"],r:73},
  {n:"Carlos Pavón",pos:["ST"],r:71},{n:"Walter Martínez",pos:["ST","LW"],r:71}
 ]}],

 "Honduras_2014":[{y:2014,p:[
  {n:"Noel Valladares",pos:["GK"],r:73},{n:"Donis Escober",pos:["GK"],r:70},{n:"Edder Delgado",pos:["GK"],r:71},
  {n:"Maynor Figueroa",pos:["CB","LB"],r:74},{n:"Osman Chávez",pos:["CB"],r:72},
  {n:"Víctor Bernárdez",pos:["CB"],r:73},{n:"Brayan Beckeles",pos:["RB","CB"],r:72},
  {n:"Emilio Izaguirre",pos:["LB","LWB"],r:74},{n:"Andy Najar",pos:["RB","RWB"],r:73},
  {n:"Luis Garrido",pos:["CDM","CM"],r:72},{n:"Wilson Palacios",pos:["CDM","CM"],r:75},
  {n:"Roger Espinoza",pos:["CM","CDM"],r:72},{n:"Jorge Claros",pos:["CDM","CM"],r:71},
  {n:"Juan Carlos García",pos:["CM"],r:70},{n:"Rony Martínez",pos:["CM","LW"],r:70},
  {n:"Marvin Chávez",pos:["LW","CM"],r:72},{n:"Luis López",pos:["CM","CDM"],r:70},
  {n:"Mario Martínez",pos:["CM","RW"],r:70},{n:"Juan Pablo Montes",pos:["LB","CM"],r:70},
  {n:"Jerry Palacios",pos:["LW","ST"],r:71},{n:"Jerry Bengtson",pos:["ST"],r:71},
  {n:"Boniek García",pos:["CM","LW"],r:73},{n:"Carlo Costly",pos:["ST"],r:73}
 ]}],

 "New_Zealand_2010":[{y:2010,p:[
  {n:"Mark Paston",pos:["GK"],r:73},{n:"Glen Moss",pos:["GK"],r:71},{n:"James Bannatyne",pos:["GK"],r:69},
  {n:"Tommy Smith",pos:["RB","CB"],r:73},{n:"Ryan Nelsen",pos:["CB"],r:77},
  {n:"Winston Reid",pos:["CB"],r:74},{n:"Ben Sigmund",pos:["CB"],r:71},
  {n:"Tony Lochhead",pos:["LB","CB"],r:70},{n:"Andrew Boyens",pos:["LB","CB"],r:70},
  {n:"Aaron Clapham",pos:["CM","CDM"],r:70},{n:"Ivan Vicelich",pos:["CDM","CM"],r:72},
  {n:"Simon Elliott",pos:["CM","CDM"],r:71},{n:"Dave Mulligan",pos:["CM"],r:69},
  {n:"Jeremy Christie",pos:["CM","CDM"],r:70},{n:"Andy Barron",pos:["CM"],r:69},
  {n:"Michael McGlinchey",pos:["LW","CM"],r:71},{n:"Leo Bertos",pos:["RW","LW"],r:71},
  {n:"Tim Brown",pos:["CM","LW"],r:70},{n:"Jeremy Brockie",pos:["LW","ST"],r:71},
  {n:"Rory Fallon",pos:["ST"],r:71},{n:"Shane Smeltz",pos:["ST"],r:72},
  {n:"Chris Killen",pos:["ST","LW"],r:72},{n:"Chris Wood",pos:["ST"],r:73}
 ]}],

 "North_Korea_2010":[{y:2010,p:[
  {n:"Myong-guk Ri",pos:["GK"],r:73},{n:"Kum-il Kim",pos:["GK"],r:70},{n:"In-guk Mun",pos:["GK"],r:70},
  {n:"Kwang-hyok Ri",pos:["RB","CB"],r:70},{n:"Nam-Chol Pak",pos:["CB"],r:70},
  {n:"Chol-hyok An",pos:["CB"],r:70},{n:"Song-chol Nam",pos:["CB","LB"],r:70},
  {n:"Chol-myong Ri",pos:["LB"],r:70},{n:"Jong-hyok Cha",pos:["CB"],r:69},
  {n:"Myong-gil Kim",pos:["CDM","CM"],r:70},{n:"Jun-il Ri",pos:["CM","CDM"],r:69},
  {n:"Yong-jun Kim",pos:["CM"],r:69},{n:"Kwang-chon Ri",pos:["CM","CDM"],r:70},
  {n:"Kyong-il Kim",pos:["CM"],r:69},{n:"Yun-nam Ji",pos:["CM","CDM"],r:70},
  {n:"Il-gwan Jong",pos:["CM","LW"],r:70},{n:"Kum-chol Choe",pos:["LW","RW"],r:70},
  {n:"Myong-won Kim",pos:["LW","CAM"],r:70},{n:"Chol-jin Pak",pos:["LW","CM"],r:70},
  {n:"Yong-jo Hong",pos:["LW","ST"],r:72},{n:"Yong-hak An",pos:["CM","CAM"],r:72},
  {n:"Tae-se Jong",pos:["ST"],r:73}
 ]}],

 "Paraguay_2006":[{y:2006,p:[
  {n:"Justo Villar",pos:["GK"],r:76},{n:"Aldo Bobadilla",pos:["GK"],r:74},{n:"Dante López",pos:["GK"],r:71},
  {n:"Carlos Gamarra",pos:["CB"],r:80},{n:"Denis Caniza",pos:["CB","RB"],r:75},
  {n:"Julio César Cáceres",pos:["CB"],r:74},{n:"Paulo da Silva",pos:["CB"],r:75},
  {n:"Delio Toledo",pos:["LB","CB"],r:71},{n:"Carlos Bonet",pos:["RB"],r:70},
  {n:"Roberto Acuña",pos:["CDM","CM"],r:76},{n:"Carlos Paredes",pos:["CDM","CM"],r:76},
  {n:"Cristian Riveros",pos:["CM","CDM"],r:74},{n:"Diego Gavilán",pos:["CM","CAM"],r:73},
  {n:"Derlis Gómez",pos:["LW","CM"],r:70},{n:"Jorge Núñez",pos:["CM"],r:69},
  {n:"Julio dos Santos",pos:["CM","CDM"],r:74},{n:"José Montiel",pos:["CM","LW"],r:70},
  {n:"Julio César Manzur",pos:["LW","ST"],r:70},{n:"Nelson Cuevas",pos:["LW","ST"],r:74},
  {n:"Édgar Barreto",pos:["CM","LW"],r:75},{n:"Nelson Haedo Valdez",pos:["ST","LW"],r:76},
  {n:"Salvador Cabañas",pos:["ST"],r:76},{n:"Roque Santa Cruz",pos:["ST","LW"],r:82}
 ]}],

 "Paraguay_2010":[{y:2010,p:[
  {n:"Justo Villar",pos:["GK"],r:76},{n:"Aldo Bobadilla",pos:["GK"],r:72},{n:"Diego Barreto",pos:["GK"],r:71},
  {n:"Paulo da Silva",pos:["CB"],r:74},{n:"Antolín Alcaraz",pos:["CB"],r:74},
  {n:"Julio César Cáceres",pos:["CB"],r:73},{n:"Denis Caniza",pos:["CB","RB"],r:73},
  {n:"Víctor Cáceres",pos:["LB","CB"],r:72},{n:"Claudio Morel",pos:["LB"],r:70},
  {n:"Carlos Bonet",pos:["RB"],r:69},{n:"Rodrigo Gamarra",pos:["CDM","CM"],r:71},
  {n:"Édgar Barreto",pos:["CM","LW"],r:74},{n:"Cristian Riveros",pos:["CM","CDM"],r:73},
  {n:"Néstor Ortigoza",pos:["CM","CDM"],r:73},{n:"Jonathan Santana",pos:["CM"],r:71},
  {n:"Darío Verón",pos:["CM","CDM"],r:72},{n:"Enrique Vera",pos:["CM"],r:70},
  {n:"Édgar Benítez",pos:["LW","RW"],r:73},{n:"Aureliano Torres",pos:["LW","CM"],r:70},
  {n:"Nelson Valdez",pos:["ST","LW"],r:75},{n:"Roque Santa Cruz",pos:["ST","LW"],r:79},
  {n:"Lucas Barrios",pos:["ST"],r:74},{n:"Óscar Cardozo",pos:["ST"],r:77}
 ]}],

 "Poland_2006":[{y:2006,p:[
  {n:"Artur Boruc",pos:["GK"],r:80},{n:"Tomasz Kuszczak",pos:["GK"],r:74},{n:"Łukasz Fabiański",pos:["GK"],r:73},
  {n:"Michał Żewłakow",pos:["RB","CB"],r:73},{n:"Jacek Bąk",pos:["CB"],r:74},
  {n:"Bartosz Bosacki",pos:["CB"],r:73},{n:"Marcin Baszczyński",pos:["CB","LB"],r:72},
  {n:"Mariusz Jop",pos:["LB","CB"],r:71},{n:"Piotr Giza",pos:["RB"],r:70},
  {n:"Arkadiusz Radomski",pos:["CDM","CM"],r:71},{n:"Mariusz Lewandowski",pos:["CDM","CM"],r:74},
  {n:"Dariusz Dudka",pos:["CDM","CM"],r:73},{n:"Mirosław Szymkowiak",pos:["CM","CDM"],r:74},
  {n:"Seweryn Gancarczyk",pos:["CM"],r:69},{n:"Kamil Kosowski",pos:["CM","LW"],r:72},
  {n:"Radosław Sobolewski",pos:["CM","CDM"],r:72},{n:"Sebastian Mila",pos:["CM","LW"],r:71},
  {n:"Jacek Krzynówek",pos:["LW","CM"],r:74},{n:"Ireneusz Jeleń",pos:["LW","ST"],r:72},
  {n:"Paweł Brożek",pos:["ST"],r:72},{n:"Euzebiusz Smolarek",pos:["RW","ST"],r:74},
  {n:"Grzegorz Rasiak",pos:["ST"],r:72},{n:"Maciej Żurawski",pos:["ST","LW"],r:74}
 ]}],

 "Russia_2014":[{y:2014,p:[
  {n:"Igor Akinfeev",pos:["GK"],r:82},{n:"Sergey Ryzhikov",pos:["GK"],r:74},{n:"Yuri Lodygin",pos:["GK"],r:73},
  {n:"Andrey Yeshchenko",pos:["RB","CB"],r:72},{n:"Vasili Berezutski",pos:["CB"],r:78},
  {n:"Sergei Ignashevich",pos:["CB"],r:80},{n:"Andrei Semyonov",pos:["CB"],r:72},
  {n:"Georgi Shchennikov",pos:["LB","CB"],r:73},{n:"Vladimir Granat",pos:["LB","CB"],r:72},
  {n:"Aleksei Kozlov",pos:["LB","CB"],r:71},{n:"Igor Denisov",pos:["CDM","CM"],r:78},
  {n:"Denis Glushakov",pos:["CM","CDM"],r:76},{n:"Viktor Fayzulin",pos:["CM","CDM"],r:73},
  {n:"Pavel Mogilevets",pos:["CM"],r:70},{n:"Oleg Shatov",pos:["LW","CM"],r:73},
  {n:"Aleksandr Kokorin",pos:["LW","ST"],r:76},{n:"Aleksandr Samedov",pos:["RW","LW"],r:74},
  {n:"Alan Dzagoev",pos:["CAM","CM"],r:77},{n:"Aleksei Ionov",pos:["LW","CM"],r:71},
  {n:"Dmitri Kombarov",pos:["LB","CM"],r:72},{n:"Yuri Zhirkov",pos:["LW","LB"],r:74},
  {n:"Aleksandr Kerzhakov",pos:["ST"],r:76},{n:"Maksim Kanunnikov",pos:["ST","LW"],r:71}
 ]}],

 "Saudi_Arabia_2006":[{y:2006,p:[
  {n:"Mohamed Al-Deayea",pos:["GK"],r:74},{n:"Malek Mouath",pos:["GK"],r:70},{n:"Ahmed Al-Bahri",pos:["GK"],r:70},
  {n:"Ahmed Al-Dokhi",pos:["CB","RB"],r:71},{n:"Hamad Al-Montashari",pos:["CB"],r:73},
  {n:"Saad Al-Harthi",pos:["CB"],r:71},{n:"Omar Al-Ghamdi",pos:["LB","CB"],r:70},
  {n:"Khaled Aziz",pos:["RB"],r:70},{n:"Saud Kariri",pos:["RB","CM"],r:70},
  {n:"Nawaf Al-Temyat",pos:["CDM","CM"],r:74},{n:"Salman Al-Faraj",pos:["CM","CDM"],r:72},
  {n:"Abdulaziz Al-Khathran",pos:["CM","CDM"],r:70},{n:"Mohammad Al-Shalhoub",pos:["CM"],r:70},
  {n:"Mohammed Ameen",pos:["CM"],r:69},{n:"Mohammad Khouja",pos:["CM"],r:69},
  {n:"Mohammad Massad",pos:["CM","CDM"],r:70},{n:"Naif Al-Qadi",pos:["LW","CM"],r:70},
  {n:"Redha Tukar",pos:["LW","RW"],r:70},{n:"Mabrouk Zaid",pos:["CM","RW"],r:69},
  {n:"Hussein Abdulghani",pos:["LW"],r:69},{n:"Mohammed Noor",pos:["LW","ST"],r:70},
  {n:"Yasser Al-Qahtani",pos:["ST","LW"],r:75},{n:"Sami Al-Jaber",pos:["ST","LW"],r:76}
 ]}],

 "Serbia_2010":[{y:2010,p:[
  {n:"Vladimir Stojković",pos:["GK"],r:77},{n:"Bojan Isailović",pos:["GK"],r:72},{n:"Ivan Obradović",pos:["GK"],r:70},
  {n:"Antonio Rukavina",pos:["RB","CB"],r:72},{n:"Branislav Ivanović",pos:["CB","RB"],r:81},
  {n:"Neven Subotić",pos:["CB"],r:80},{n:"Nemanja Vidić",pos:["CB"],r:87},
  {n:"Aleksandar Luković",pos:["LB","CB"],r:73},{n:"Aleksandar Kolarov",pos:["LB","LWB"],r:79},
  {n:"Dejan Stanković",pos:["CM","CAM"],r:82},{n:"Zdravko Kuzmanović",pos:["CDM","CM"],r:74},
  {n:"Gojko Kačar",pos:["CM","CDM"],r:72},{n:"Anđelko Đuričić",pos:["CM"],r:70},
  {n:"Radosav Petrović",pos:["CDM","CM"],r:73},{n:"Nenad Milijaš",pos:["CM","CAM"],r:73},
  {n:"Zoran Tošić",pos:["LW","RW"],r:73},{n:"Miloš Krasić",pos:["RW","LW"],r:74},
  {n:"Miloš Ninković",pos:["CAM","LW"],r:71},{n:"Danko Lazović",pos:["LW","ST"],r:72},
  {n:"Milan Jovanović",pos:["LW","ST"],r:72},{n:"Dragan Mrđa",pos:["ST"],r:71},
  {n:"Marko Pantelić",pos:["ST"],r:73},{n:"Nikola Žigić",pos:["ST"],r:75}
 ]}],

 "Serbia_and_Montenegro_2006":[{y:2006,p:[
  {n:"Dragoslav Jevrić",pos:["GK"],r:74},{n:"Vladimir Stojković",pos:["GK"],r:77},{n:"Oliver Kovačević",pos:["GK"],r:70},
  {n:"Dušan Basta",pos:["RB","CB"],r:73},{n:"Mladen Krstajić",pos:["CB"],r:77},
  {n:"Nemanja Vidić",pos:["CB"],r:85},{n:"Ivica Dragutinović",pos:["CB"],r:77},
  {n:"Milan Dudić",pos:["LB","CB"],r:72},{n:"Nenad Đorđević",pos:["LB"],r:70},
  {n:"Dejan Stanković",pos:["CM","CAM"],r:84},{n:"Igor Duljaj",pos:["CDM","CM"],r:73},
  {n:"Ivan Ergić",pos:["CDM","CM"],r:72},{n:"Ognjen Koroman",pos:["LW","CM"],r:72},
  {n:"Saša Ilić",pos:["CM","CAM"],r:73},{n:"Zvonimir Vukić",pos:["CM","CDM"],r:72},
  {n:"Predrag Đorđević",pos:["CM"],r:70},{n:"Albert Nađ",pos:["CM","LW"],r:71},
  {n:"Goran Gavrančić",pos:["CB","CDM"],r:73},{n:"Mateja Kežman",pos:["ST","LW"],r:79},
  {n:"Savo Milošević",pos:["ST"],r:77},{n:"Nikola Žigić",pos:["ST"],r:76},
  {n:"Danijel Ljuboja",pos:["ST","LW"],r:72}
 ]}],

 "Slovakia_2010":[{y:2010,p:[
  {n:"Ján Mucha",pos:["GK"],r:75},{n:"Dušan Perniš",pos:["GK"],r:73},{n:"Dušan Kuciak",pos:["GK"],r:72},
  {n:"Peter Pekarík",pos:["RB","RWB"],r:75},{n:"Kornel Saláta",pos:["CB"],r:72},
  {n:"Martin Škrtel",pos:["CB"],r:83},{n:"Ján Ďurica",pos:["CB"],r:74},
  {n:"Radoslav Zabavník",pos:["LB","CB"],r:72},{n:"Zdeno Štrba",pos:["CDM","CM"],r:70},
  {n:"Ján Kozák",pos:["CDM","CM"],r:70},{n:"Juraj Kucka",pos:["CM","CDM"],r:74},
  {n:"Marek Sapara",pos:["CM","CDM"],r:72},{n:"Martin Petráš",pos:["CM"],r:71},
  {n:"Kamil Kopúnek",pos:["CM","LW"],r:71},{n:"Vladimír Weiss",pos:["RW","CAM"],r:74},
  {n:"Miroslav Stoch",pos:["LW","RW"],r:73},{n:"Filip Hološko",pos:["LW","ST"],r:73},
  {n:"Marek Čech",pos:["CM","LW"],r:70},{n:"Erik Jendrišek",pos:["ST","LW"],r:72},
  {n:"Stanislav Šesták",pos:["ST"],r:73},{n:"Martin Jakubko",pos:["ST"],r:71},
  {n:"Róbert Vittek",pos:["ST"],r:75},{n:"Marek Hamšík",pos:["CAM","CM"],r:83}
 ]}],

 "Slovenia_2010":[{y:2010,p:[
  {n:"Samir Handanović",pos:["GK"],r:82},{n:"Jasmin Handanović",pos:["GK"],r:71},{n:"Matej Mavrič",pos:["GK"],r:70},
  {n:"Boštjan Cesar",pos:["CB"],r:75},{n:"Marko Šuler",pos:["CB"],r:73},
  {n:"Mišo Brečko",pos:["RB","CB"],r:72},{n:"Bojan Jokić",pos:["LB","LWB"],r:74},
  {n:"Andrej Komac",pos:["CDM","CM"],r:71},{n:"Suad Fileković",pos:["CB","LB"],r:70},
  {n:"Aleksandar Radosavljević",pos:["CM","CDM"],r:71},{n:"Aleksander Šeliga",pos:["CM"],r:69},
  {n:"Robert Koren",pos:["CM","CAM"],r:76},{n:"Rene Krhin",pos:["CM","CDM"],r:73},
  {n:"Andraž Kirm",pos:["LW","CM"],r:72},{n:"Branko Ilić",pos:["CM","CDM"],r:71},
  {n:"Dalibor Stevanović",pos:["LW","RW"],r:70},{n:"Elvedin Džinić",pos:["LW","CM"],r:70},
  {n:"Valter Birsa",pos:["LW","CAM"],r:73},{n:"Nejc Pečnik",pos:["ST","LW"],r:72},
  {n:"Zlatko Dedić",pos:["ST","LW"],r:71},{n:"Tim Matavž",pos:["ST"],r:73},
  {n:"Zlatan Ljubijankić",pos:["ST","LW"],r:73},{n:"Milivoje Novaković",pos:["ST"],r:75}
 ]}],

 "South_Africa_2010":[{y:2010,p:[
  {n:"Itumeleng Khune",pos:["GK"],r:75},{n:"Moeneeb Josephs",pos:["GK"],r:72},{n:"Shu-Aib Walters",pos:["GK"],r:70},
  {n:"Siboniso Gaxa",pos:["RB","CB"],r:72},{n:"Aaron Mokoena",pos:["CB","CDM"],r:76},
  {n:"Bongani Khumalo",pos:["CB"],r:73},{n:"Matthew Booth",pos:["CB"],r:73},
  {n:"Tsepo Masilela",pos:["LB","CB"],r:72},{n:"Lucas Thwala",pos:["LB"],r:70},
  {n:"Anele Ngcongca",pos:["RB","CM"],r:72},{n:"MacBeth Sibaya",pos:["CDM","CM"],r:73},
  {n:"Siyabonga Sangweni",pos:["CM","CDM"],r:71},{n:"Kagisho Dikgacoi",pos:["CM","CDM"],r:73},
  {n:"Reneilwe Letsholonyane",pos:["CM"],r:70},{n:"Thanduyise Khuboni",pos:["CM"],r:69},
  {n:"Surprise Moriri",pos:["LW","CM"],r:72},{n:"Lance Davids",pos:["RW","LW"],r:71},
  {n:"Teko Modise",pos:["LW","CAM"],r:74},{n:"Siphiwe Tshabalala",pos:["LW","CM"],r:75},
  {n:"Siyabonga Nomvethe",pos:["LW","ST"],r:71},{n:"Katlego Mphela",pos:["ST"],r:72},
  {n:"Bernard Parker",pos:["ST","LW"],r:73},{n:"Steven Pienaar",pos:["CM","LW"],r:78}
 ]}],

 "Switzerland_2006":[{y:2006,p:[
  {n:"Pascal Zuberbühler",pos:["GK"],r:78},{n:"Fabio Coltorti",pos:["GK"],r:72},{n:"Diego Benaglio",pos:["GK"],r:74},
  {n:"Christoph Spycher",pos:["RB","CB"],r:74},{n:"Patrick Müller",pos:["CB"],r:77},
  {n:"Philippe Senderos",pos:["CB"],r:78},{n:"Stéphane Grichting",pos:["CB"],r:74},
  {n:"Ludovic Magnin",pos:["LB","LWB"],r:75},{n:"Philipp Degen",pos:["RB"],r:73},
  {n:"Johann Vogel",pos:["CDM","CM"],r:78},{n:"Valon Behrami",pos:["CM","CDM"],r:76},
  {n:"Raphaël Wicky",pos:["CM","CDM"],r:74},{n:"Tranquillo Barnetta",pos:["LW","CM"],r:76},
  {n:"Johan Djourou",pos:["CB","CDM"],r:74},{n:"Blerim Džemaili",pos:["CM","CAM"],r:74},
  {n:"Ricardo Cabanas",pos:["CM","LW"],r:72},{n:"David Degen",pos:["LW","RW"],r:71},
  {n:"Xavier Margairaz",pos:["CM","LW"],r:71},{n:"Hakan Yakin",pos:["CAM","CM"],r:77},
  {n:"Daniel Gygax",pos:["LW","CM"],r:71},{n:"Marco Streller",pos:["ST"],r:73},
  {n:"Mauro Lustrinelli",pos:["ST"],r:70},{n:"Alexander Frei",pos:["ST","LW"],r:78}
 ]}],

 "Switzerland_2010":[{y:2010,p:[
  {n:"Diego Benaglio",pos:["GK"],r:79},{n:"Marco Wölfli",pos:["GK"],r:73},{n:"Johnny Leoni",pos:["GK"],r:70},
  {n:"Stephan Lichtsteiner",pos:["RB","RWB"],r:79},{n:"Philippe Senderos",pos:["CB"],r:76},
  {n:"Steve von Bergen",pos:["CB"],r:74},{n:"Stéphane Grichting",pos:["CB"],r:73},
  {n:"Reto Ziegler",pos:["LB","LWB"],r:73},{n:"Mario Eggimann",pos:["CB"],r:72},
  {n:"Ludovic Magnin",pos:["LB","LWB"],r:73},{n:"Gélson Fernandes",pos:["CDM","CM"],r:74},
  {n:"Gökhan Inler",pos:["CDM","CM"],r:78},{n:"Valon Behrami",pos:["CM","CDM"],r:77},
  {n:"Benjamin Huggel",pos:["CM","CDM"],r:72},{n:"Pirmin Schwegler",pos:["CM","CDM"],r:72},
  {n:"Marco Padalino",pos:["CM"],r:69},{n:"Tranquillo Barnetta",pos:["LW","CM"],r:75},
  {n:"Hakan Yakin",pos:["CAM","CM"],r:74},{n:"Albert Bunjaku",pos:["LW","ST"],r:70},
  {n:"Eren Derdiyok",pos:["ST","LW"],r:73},{n:"Blaise Nkufo",pos:["ST"],r:73},
  {n:"Alexander Frei",pos:["ST","LW"],r:76},{n:"Xherdan Shaqiri",pos:["RW","CAM","LW"],r:77}
 ]}],

 "Switzerland_2014":[{y:2014,p:[
  {n:"Diego Benaglio",pos:["GK"],r:79},{n:"Roman Bürki",pos:["GK"],r:76},{n:"Yann Sommer",pos:["GK"],r:79},
  {n:"Stephan Lichtsteiner",pos:["RB","RWB"],r:80},{n:"Fabian Schär",pos:["CB","CDM"],r:77},
  {n:"Philippe Senderos",pos:["CB"],r:74},{n:"Steve von Bergen",pos:["CB"],r:73},
  {n:"Johan Djourou",pos:["CB"],r:74},{n:"Michael Lang",pos:["RB","CB"],r:73},
  {n:"Reto Ziegler",pos:["LB","LWB"],r:72},{n:"Ricardo Rodríguez",pos:["LB","LWB"],r:77},
  {n:"Gélson Fernandes",pos:["CDM","CM"],r:73},{n:"Gökhan Inler",pos:["CDM","CM"],r:77},
  {n:"Blerim Džemaili",pos:["CM","CAM"],r:74},{n:"Valon Behrami",pos:["CM","CDM"],r:76},
  {n:"Granit Xhaka",pos:["CM","CDM"],r:78},{n:"Valentin Stocker",pos:["CM","RW"],r:73},
  {n:"Admir Mehmedi",pos:["LW","ST"],r:74},{n:"Tranquillo Barnetta",pos:["LW","CM"],r:73},
  {n:"Josip Drmić",pos:["ST","LW"],r:72},{n:"Haris Seferovic",pos:["ST","LW"],r:73},
  {n:"Mario Gavranović",pos:["ST"],r:71},{n:"Xherdan Shaqiri",pos:["RW","CAM","LW"],r:80}
 ]}],

 "Togo_2006":[{y:2006,p:[
  {n:"Kossi Agassa",pos:["GK"],r:74},{n:"Kodjovi Obilalé",pos:["GK"],r:70},{n:"Robert Malm",pos:["GK"],r:69},
  {n:"Jean-Paul Abalo",pos:["RB","CB"],r:71},{n:"Assimiou Touré",pos:["CB"],r:73},
  {n:"Dare Nibombe",pos:["CB"],r:72},{n:"Massamasso Tchangai",pos:["LB","CB"],r:71},
  {n:"Chérif Touré Mamam",pos:["LB"],r:70},{n:"Affo Erassa",pos:["RB"],r:69},
  {n:"Alaixys Romao",pos:["CDM","CM"],r:75},{n:"Moustapha Salifou",pos:["CM","CDM"],r:73},
  {n:"Ouro-Nimini Tchagnirou",pos:["CM"],r:70},{n:"Eric Akoto",pos:["CM","CDM"],r:70},
  {n:"Kuami Agboh",pos:["CM"],r:69},{n:"Ludovic Assemoassa",pos:["CM"],r:69},
  {n:"Yao Aziawonou",pos:["LW","CM"],r:71},{n:"Thomas Dossevi",pos:["LW","RW"],r:73},
  {n:"Richmond Forson",pos:["RW","LW"],r:70},{n:"Franck Atsou",pos:["LW","ST"],r:70},
  {n:"Mohamed Kader",pos:["ST","LW"],r:73},{n:"Yao Junior Sènaya",pos:["ST"],r:70},
  {n:"Adékambi Olufadé",pos:["ST","LW"],r:71},{n:"Emmanuel Adebayor",pos:["ST"],r:81}
 ]}],

 "Trinidad_and_Tobago_2006":[{y:2006,p:[
  {n:"Shaka Hislop",pos:["GK"],r:74},{n:"Clayton Ince",pos:["GK"],r:75},{n:"Kelvin Jack",pos:["GK"],r:72},
  {n:"Brent Sancho",pos:["CB"],r:72},{n:"Dennis Lawrence",pos:["CB"],r:73},
  {n:"Ian Cox",pos:["CB","LB"],r:71},{n:"Marvin Andrews",pos:["CB"],r:73},
  {n:"Aurtis Whitley",pos:["LB","CB"],r:70},{n:"Avery John",pos:["LB"],r:70},
  {n:"Densill Theobald",pos:["CDM","CM"],r:73},{n:"David Atiba Charles",pos:["CM","CDM"],r:70},
  {n:"Anthony Wolfe",pos:["CM","CDM"],r:70},{n:"Evans Wise",pos:["CM"],r:69},
  {n:"Russell Latapy",pos:["CAM","CM"],r:74},{n:"Carlos Edwards",pos:["RW","LW"],r:74},
  {n:"Chris Birchall",pos:["LW","CM"],r:71},{n:"Jason Scotland",pos:["LW","ST"],r:72},
  {n:"Collin Samuel",pos:["LW","ST"],r:71},{n:"Cornell Glen",pos:["LW","ST"],r:70},
  {n:"Cyd Gray",pos:["CM","CDM"],r:69},{n:"Kenwyne Jones",pos:["ST"],r:75},
  {n:"Stern John",pos:["ST","LW"],r:74},{n:"Dwight Yorke",pos:["ST","CAM"],r:77}
 ]}],

 "Tunisia_2006":[{y:2006,p:[
  {n:"Ali Boumnijel",pos:["GK"],r:76},{n:"Hamdi Kasraoui",pos:["GK"],r:72},{n:"Aymen Mathlouthi",pos:["GK"],r:71},
  {n:"Hatem Trabelsi",pos:["RB","RWB"],r:76},{n:"Radhi Jaïdi",pos:["CB"],r:77},
  {n:"Karim Haggui",pos:["CB"],r:74},{n:"Karim Saidi",pos:["CB","LB"],r:74},
  {n:"David Jemmali",pos:["LB","CB"],r:72},{n:"Alaeddine Yahia",pos:["CB"],r:73},
  {n:"Mehdi Nafti",pos:["CDM","CM"],r:73},{n:"Karim Essediri",pos:["CM","CDM"],r:70},
  {n:"Riadh Bouazizi",pos:["CM","CDM"],r:71},{n:"Kaies Ghodhbane",pos:["CM"],r:69},
  {n:"Jawhar Mnari",pos:["CM","CAM"],r:73},{n:"Hamed Namouchi",pos:["CM","LW"],r:71},
  {n:"Sofiane Melliti",pos:["CM","LW"],r:70},{n:"Anis Ayari",pos:["CM","LW"],r:70},
  {n:"Adel Nefzi",pos:["LW","RW"],r:70},{n:"Adel Chedli",pos:["CAM","LW"],r:72},
  {n:"Francileudo Santos",pos:["LB","CDM"],r:73},{n:"Yassine Chikhaoui",pos:["LW","CAM"],r:75},
  {n:"Chaouki Ben Saada",pos:["LW","ST"],r:72},{n:"Ziad Jaziri",pos:["ST","LW"],r:72}
 ]}],

 "Ukraine_2006":[{y:2006,p:[
  {n:"Oleksandr Shovkovskyi",pos:["GK"],r:80},{n:"Andriy Pyatov",pos:["GK"],r:77},{n:"Bohdan Shust",pos:["GK"],r:70},
  {n:"Andriy Rusol",pos:["RB","CB"],r:74},{n:"Vladyslav Vashchuk",pos:["CB"],r:76},
  {n:"Andriy Nesmachniy",pos:["LB","LWB"],r:74},{n:"Andriy Husin",pos:["CB","CDM"],r:73},
  {n:"Volodymyr Yezerskiy",pos:["CB"],r:71},{n:"Vyacheslav Sviderskyi",pos:["LB","CB"],r:70},
  {n:"Anatoliy Tymoshchuk",pos:["CDM","CM"],r:81},{n:"Oleh Shelayev",pos:["CDM","CM"],r:72},
  {n:"Ruslan Rotan",pos:["CM","CAM"],r:74},{n:"Maksym Kalynychenko",pos:["CM","CAM"],r:73},
  {n:"Serhiy Nazarenko",pos:["CM","LW"],r:72},{n:"Oleksiy Byelik",pos:["CM","CDM"],r:70},
  {n:"Oleh Husyev",pos:["LW","CM"],r:74},{n:"Oleksandr Yatsenko",pos:["LW","RW"],r:71},
  {n:"Dmytro Chyhrynskyi",pos:["CB","CDM"],r:74},{n:"Serhii Rebrov",pos:["CAM","ST"],r:77},
  {n:"Andriy Vorobey",pos:["LW","ST"],r:72},{n:"Artem Milevskyi",pos:["ST","LW"],r:74},
  {n:"Andriy Voronin",pos:["ST","LW"],r:78},{n:"Andriy Shevchenko",pos:["ST"],r:90}
 ]}],

 "United_States_2006":[{y:2006,p:[
  {n:"Kasey Keller",pos:["GK"],r:79},{n:"Tim Howard",pos:["GK"],r:82},{n:"Marcus Hahnemann",pos:["GK"],r:74},
  {n:"Steve Cherundolo",pos:["RB","CB"],r:75},{n:"Oguchi Onyewu",pos:["CB"],r:79},
  {n:"Eddie Pope",pos:["CB"],r:76},{n:"Carlos Bocanegra",pos:["CB","LB"],r:76},
  {n:"Chris Albright",pos:["RB"],r:72},{n:"Gregg Berhalter",pos:["CB","CDM"],r:72},
  {n:"Claudio Reyna",pos:["CM","CAM"],r:77},{n:"Pablo Mastroeni",pos:["CDM","CM"],r:74},
  {n:"John O'Brien",pos:["CM","CDM"],r:73},{n:"Ben Olsen",pos:["CM","LW"],r:72},
  {n:"Eddie Lewis",pos:["LW","LM"],r:73},{n:"DaMarcus Beasley",pos:["LW","CM"],r:76},
  {n:"Bobby Convey",pos:["LW","LM"],r:72},{n:"Clint Dempsey",pos:["CAM","LW"],r:77},
  {n:"Josh Wolff",pos:["LW","ST"],r:71},{n:"Eddie Johnson",pos:["ST","LW"],r:72},
  {n:"Brian Ching",pos:["ST"],r:71},{n:"Brian McBride",pos:["ST"],r:77},
  {n:"Landon Donovan",pos:["LW","CAM"],r:82}
 ]}],

 "United_States_2010":[{y:2010,p:[
  {n:"Tim Howard",pos:["GK"],r:83},{n:"Marcus Hahnemann",pos:["GK"],r:73},{n:"Brad Guzan",pos:["GK"],r:76},
  {n:"Steve Cherundolo",pos:["RB","CB"],r:74},{n:"Jay DeMerit",pos:["CB"],r:74},
  {n:"Oguchi Onyewu",pos:["CB"],r:78},{n:"Jonathan Bornstein",pos:["LB","CB"],r:71},
  {n:"Carlos Bocanegra",pos:["CB","LB"],r:75},{n:"Jonathan Spector",pos:["RB","CM"],r:72},
  {n:"Stuart Holden",pos:["CM","CDM"],r:73},{n:"Ricardo Clark",pos:["CDM","CM"],r:72},
  {n:"Michael Bradley",pos:["CM","CDM"],r:78},{n:"Clarence Goodson",pos:["CB"],r:72},
  {n:"Maurice Edu",pos:["CDM","CM"],r:72},{n:"José Francisco Torres",pos:["CM","LW"],r:72},
  {n:"Benny Feilhaber",pos:["CM","CAM"],r:72},{n:"DaMarcus Beasley",pos:["LW","CM"],r:74},
  {n:"Shaun Wright-Phillips",pos:["RW","LW"],r:71},{n:"Edson Buddle",pos:["ST"],r:71},
  {n:"Robbie Findley",pos:["ST","LW"],r:70},{n:"Herculez Gomez",pos:["ST","LW"],r:72},
  {n:"Jozy Altidore",pos:["ST"],r:74},{n:"Landon Donovan",pos:["LW","CAM"],r:82},
  {n:"Clint Dempsey",pos:["CAM","LW"],r:80}
 ]}],

 "United_States_2014":[{y:2014,p:[
  {n:"Tim Howard",pos:["GK"],r:83},{n:"Nick Rimando",pos:["GK"],r:73},{n:"Brad Guzan",pos:["GK"],r:77},
  {n:"DeAndre Yedlin",pos:["RB","RWB"],r:74},{n:"Geoff Cameron",pos:["CB","CM"],r:76},
  {n:"Omar Gonzalez",pos:["CB"],r:74},{n:"Matt Besler",pos:["CB"],r:74},
  {n:"Timothy Chandler",pos:["RB","CB"],r:73},{n:"DaMarcus Beasley",pos:["LB","LWB"],r:72},
  {n:"Kyle Beckerman",pos:["CDM","CM"],r:73},{n:"Michael Bradley",pos:["CM","CDM"],r:79},
  {n:"Jermaine Jones",pos:["CM","CDM"],r:76},{n:"Alejandro Bedoya",pos:["CM","LW"],r:74},
  {n:"Brad Davis",pos:["LW","LM"],r:72},{n:"Fabian Johnson",pos:["LW","LB"],r:74},
  {n:"Mix Diskerud",pos:["CM","CAM"],r:72},{n:"Graham Zusi",pos:["RW","CM"],r:73},
  {n:"John Brooks",pos:["CB"],r:74},{n:"Julian Green",pos:["LW","CAM"],r:73},
  {n:"Aron Jóhannsson",pos:["ST"],r:73},{n:"Chris Wondolowski",pos:["ST"],r:72},
  {n:"Jozy Altidore",pos:["ST"],r:76},{n:"Clint Dempsey",pos:["CAM","ST"],r:81}
 ]}],

 "Iran_2006":[{y:2006,p:[
  {n:"Ebrahim Mirzapour",pos:["GK"],r:74},{n:"Mehrzad Madanchi",pos:["GK"],r:70},{n:"Vahid Talebloo",pos:["GK"],r:70},
  {n:"Sohrab Bakhtiarizadeh",pos:["RB","CB"],r:70},{n:"Rahman Rezaei",pos:["CB"],r:74},
  {n:"Amir Hossein Sadeghi",pos:["CB"],r:72},{n:"Vahid Hashemian",pos:["CB","CDM"],r:73},
  {n:"Mohammad Nosrati",pos:["LB","CB"],r:72},{n:"Hossein Kaebi",pos:["LB","CM"],r:73},
  {n:"Moharram Navidkia",pos:["CM","CDM"],r:72},{n:"Masoud Shojaei",pos:["CM","CDM"],r:75},
  {n:"Hassan Roudbarian",pos:["CDM","CM"],r:70},{n:"Javad Kazemian",pos:["CM"],r:69},
  {n:"Reza Enayati",pos:["CM","CAM"],r:70},{n:"Andranik Teymourian",pos:["CM","CDM"],r:74},
  {n:"Ali Karimi",pos:["CAM","LW"],r:82},{n:"Mehdi Mahdavikia",pos:["RW","CM"],r:77},
  {n:"Ferydoon Zandi",pos:["LW","ST"],r:72},{n:"Javad Nekounam",pos:["CM","CAM"],r:76},
  {n:"Arash Borhani",pos:["LW","RW"],r:71},{n:"Rasoul Khatibi",pos:["ST"],r:70},
  {n:"Yahya Golmohammadi",pos:["CDM","CB"],r:74},{n:"Ali Daei",pos:["ST"],r:79}
 ]}],

 "Iran_2014":[{y:2014,p:[
  {n:"Alireza Haghighi",pos:["GK"],r:74},{n:"Pejman Montazeri",pos:["GK"],r:72},{n:"Daniel Davari",pos:["GK"],r:71},
  {n:"Jalal Hosseini",pos:["RB","CB"],r:73},{n:"Amir Hossein Sadeghi",pos:["CB"],r:72},
  {n:"Hossein Mahini",pos:["CB","LB"],r:72},{n:"Hashem Beikzadeh",pos:["CB"],r:71},
  {n:"Reza Haghighi",pos:["LB","CB"],r:71},{n:"Khosro Heydari",pos:["RB","CM"],r:72},
  {n:"Andranik Teymourian",pos:["CDM","CM"],r:73},{n:"Javad Nekounam",pos:["CM","CAM"],r:75},
  {n:"Masoud Shojaei",pos:["CM","CDM"],r:75},{n:"Bakhtiar Rahmani",pos:["CM","CDM"],r:70},
  {n:"Ahmad Alenemeh",pos:["CM"],r:69},{n:"Ghasem Haddadifar",pos:["CM","CDM"],r:70},
  {n:"Ehsan Hajsafi",pos:["LB","LWB"],r:74},{n:"Steven Beitashour",pos:["RB","CM"],r:71},
  {n:"Ashkan Dejagah",pos:["LW","CAM"],r:75},{n:"Rahman Ahmadi",pos:["CM","LW"],r:70},
  {n:"Mehrdad Pooladi",pos:["LW","ST"],r:72},{n:"Alireza Jahanbakhsh",pos:["RW","LW","ST"],r:74},
  {n:"Karim Ansarifard",pos:["ST"],r:74},{n:"Reza Ghoochannejhad",pos:["ST"],r:74}
 ]}],

 "Austria_1998":[{y:1998,p:[
  {n:"Franz Wohlfahrt",pos:["GK"],r:76},{n:"Michael Konsel",pos:["GK"],r:74},{n:"Wolfgang Knaller",pos:["GK"],r:70},
  {n:"Martin Hiden",pos:["RB","CB"],r:75},{n:"Peter Schöttel",pos:["CB"],r:76},
  {n:"Wolfgang Feiersinger",pos:["CB"],r:74},{n:"Anton Pfeffer",pos:["CB","LB"],r:72},
  {n:"Andreas Heraf",pos:["LB","CB"],r:72},{n:"Arnold Wetl",pos:["RB"],r:70},
  {n:"Markus Schopp",pos:["CDM","CM"],r:73},{n:"Dietmar Kühbauer",pos:["CM","CDM"],r:74},
  {n:"Walter Kogler",pos:["CM","CDM"],r:71},{n:"Andi Herzog",pos:["CM","CAM"],r:76},
  {n:"Harald Cerny",pos:["CM","LW"],r:71},{n:"Roman Mählich",pos:["LW","CM"],r:70},
  {n:"Heimo Pfeifenberger",pos:["LW","CM"],r:70},{n:"Mario Haas",pos:["LW","ST"],r:73},
  {n:"Hannes Reinmayr",pos:["CM","LW"],r:70},{n:"Peter Stöger",pos:["CAM","ST"],r:73},
  {n:"Ivica Vastić",pos:["ST","LW"],r:74},{n:"Toni Polster",pos:["ST"],r:78},
  {n:"Martin Amerhauser",pos:["ST"],r:70}
 ]}],

 "Bolivia_1994":[{y:1994,p:[
  {n:"Carlos Trucco",pos:["GK"],r:73},{n:"Marcelo Torrico",pos:["GK"],r:72},{n:"Óscar Sánchez",pos:["GK"],r:70},
  {n:"Marco Sandy",pos:["CB","CDM"],r:74},{n:"Gustavo Quinteros",pos:["CB"],r:74},
  {n:"Juan Manuel Peña",pos:["CB"],r:72},{n:"Mauricio Ramos",pos:["CB","LB"],r:71},
  {n:"Luis Cristaldo",pos:["RB","CB"],r:70},{n:"Carlos Borja",pos:["LB","CB"],r:70},
  {n:"Julio César Baldivieso",pos:["CDM","CM"],r:74},{n:"Ramiro Castillo",pos:["CM","CDM"],r:70},
  {n:"Mario Pinedo",pos:["CM","CDM"],r:70},{n:"Vladimir Soria",pos:["CM"],r:70},
  {n:"Modesto Soruco",pos:["CM","LW"],r:70},{n:"Álvaro Peña",pos:["LW","CM"],r:71},
  {n:"Darío Rojas",pos:["LW","CM"],r:70},{n:"William Ramallo",pos:["LW","ST"],r:72},
  {n:"Jaime Moreno",pos:["ST","LW"],r:74},{n:"Miguel Rimba",pos:["ST"],r:70},
  {n:"Luis Cristaldo",pos:["RB","CM"],r:70},{n:"Erwin Sánchez",pos:["CAM","LW"],r:76},
  {n:"Marco Etcheverry",pos:["CAM","CM"],r:80}
 ]}],

 "Bulgaria_1994":[{y:1994,p:[
  {n:"Borislav Mihaylov",pos:["GK"],r:80},{n:"Plamen Nikolov",pos:["GK"],r:72},{n:"Georgi Georgiev",pos:["GK"],r:70},
  {n:"Trifon Ivanov",pos:["CB"],r:77},{n:"Petar Hubchev",pos:["CB"],r:75},
  {n:"Tsanko Tsvetanov",pos:["CB","RB"],r:72},{n:"Petar Aleksandrov",pos:["CB"],r:72},
  {n:"Zlatko Yankov",pos:["LB","CB"],r:73},{n:"Nikolay Iliev",pos:["LB"],r:71},
  {n:"Yordan Letchkov",pos:["CDM","CM"],r:79},{n:"Ivaylo Yordanov",pos:["CM","CDM"],r:75},
  {n:"Daniel Borimirov",pos:["CM","CDM"],r:74},{n:"Boncho Genchev",pos:["CM"],r:71},
  {n:"Ivaylo Andonov",pos:["CM"],r:70},{n:"Velko Yotov",pos:["CM","LW"],r:71},
  {n:"Iliyan Kiryakov",pos:["RW","CM"],r:73},{n:"Emil Kremenliev",pos:["LW","CM"],r:72},
  {n:"Krasimir Balakov",pos:["CAM","CM"],r:82},{n:"Nasko Sirakov",pos:["LW","ST"],r:75},
  {n:"Emil Kostadinov",pos:["ST","LW"],r:78},{n:"Petar Mihtarski",pos:["ST"],r:73},
  {n:"Hristo Stoichkov",pos:["LW","ST"],r:91}
 ]}],

 "Bulgaria_1998":[{y:1998,p:[
  {n:"Zdravko Zdravkov",pos:["GK"],r:73},{n:"Borislav Mihaylov",pos:["GK"],r:76},{n:"Anatoli Nankov",pos:["GK"],r:70},
  {n:"Adalbert Zafirov",pos:["RB","CB"],r:71},{n:"Trifon Ivanov",pos:["CB"],r:74},
  {n:"Radostin Kishishev",pos:["RB","CM"],r:74},{n:"Milen Petkov",pos:["CB"],r:71},
  {n:"Zlatko Yankov",pos:["LB","CB"],r:72},{n:"Rosen Kirilov",pos:["LB","CM"],r:71},
  {n:"Ivaylo Yordanov",pos:["CM","CDM"],r:74},{n:"Daniel Borimirov",pos:["CM","CDM"],r:73},
  {n:"Georgi Bachev",pos:["CDM","CM"],r:71},{n:"Stoycho Stoilov",pos:["CM","CDM"],r:73},
  {n:"Ilian Iliev",pos:["CM","CAM"],r:72},{n:"Ivaylo Petkov",pos:["CM"],r:70},
  {n:"Gosho Ginchev",pos:["LW","CM"],r:70},{n:"Marian Hristov",pos:["LW","RW"],r:73},
  {n:"Emil Kostadinov",pos:["ST","LW"],r:75},{n:"Georgi Ivanov",pos:["LW","ST"],r:70},
  {n:"Lyuboslav Penev",pos:["ST"],r:74},{n:"Krasimir Balakov",pos:["CAM","CM"],r:80},
  {n:"Hristo Stoichkov",pos:["LW","ST"],r:87}
 ]}],

 "Chile_1998":[{y:1998,p:[
  {n:"Nelson Tapia",pos:["GK"],r:74},{n:"Nelson Parraguez",pos:["GK"],r:71},{n:"Moisés Villarroel",pos:["GK"],r:70},
  {n:"Ronald Fuentes",pos:["RB","CB"],r:73},{n:"Javier Margas",pos:["CB"],r:74},
  {n:"Pedro Reyes",pos:["CB"],r:72},{n:"Mauricio Aros",pos:["CB","LB"],r:71},
  {n:"Rodrigo Barrera",pos:["LB","CB"],r:71},{n:"Carlos Tejas",pos:["LB"],r:70},
  {n:"José Luis Sierra",pos:["CDM","CM"],r:75},{n:"Clarence Acuña",pos:["CM","CDM"],r:73},
  {n:"Fernando Cornejo",pos:["CM","CDM"],r:71},{n:"Luis Musrri",pos:["CM"],r:70},
  {n:"Francisco Rojas",pos:["CM","CDM"],r:71},{n:"Miguel Ramírez",pos:["CM","LW"],r:70},
  {n:"Fabián Estay",pos:["LW","CM"],r:72},{n:"Marcelo Vega",pos:["CAM","CM"],r:74},
  {n:"Manuel Neira",pos:["LW","ST"],r:70},{n:"Cristián Castañeda",pos:["LW","ST"],r:70},
  {n:"Marcelo Salas",pos:["ST"],r:82},{n:"Iván Zamorano",pos:["ST"],r:84},
  {n:"Marcelo Ramírez",pos:["LW","ST"],r:70}
 ]}],

 "China_2002":[{y:2002,p:[
  {n:"Zhiyi Fan",pos:["GK"],r:72},{n:"Yunlong Xu",pos:["GK"],r:70},{n:"Jin Jiang",pos:["GK"],r:70},
  {n:"Jihai Sun",pos:["RB","RWB"],r:74},{n:"Weifeng Li",pos:["CB"],r:74},
  {n:"Enhua Zhang",pos:["CB"],r:73},{n:"Xiaopeng Li",pos:["CB","LB"],r:72},
  {n:"Wei Du",pos:["LB","CB"],r:71},{n:"Bo Qu",pos:["LB"],r:70},
  {n:"Genwei Yu",pos:["CDM","CM"],r:72},{n:"Qi An",pos:["CM","CDM"],r:71},
  {n:"Junzhe Zhao",pos:["CM","CDM"],r:70},{n:"Jiayi Shao",pos:["CM"],r:72},
  {n:"Maozhen Su",pos:["CM","LW"],r:71},{n:"Chengying Wu",pos:["CM","CDM"],r:70},
  {n:"Pu Yang",pos:["CM","LW"],r:70},{n:"Chuliang Ou",pos:["LW","CAM"],r:72},
  {n:"Hong Qi",pos:["LW","ST"],r:70},{n:"Mingyu Ma",pos:["LW","ST"],r:70},
  {n:"Chen Yang",pos:["CM"],r:69},{n:"Yao Gao",pos:["LW","ST"],r:70},
  {n:"Tie Li",pos:["ST","LW"],r:70},{n:"Haidong Hao",pos:["ST"],r:75}
 ]}],

 "Costa_Rica_2002":[{y:2002,p:[
  {n:"Álvaro Mesén",pos:["GK"],r:74},{n:"Carlos Castro",pos:["GK"],r:71},{n:"Steven Bryce",pos:["GK"],r:70},
  {n:"Mauricio Wright",pos:["RB","CB"],r:73},{n:"Jervis Drummond",pos:["CB"],r:71},
  {n:"Gilberto Martínez",pos:["CB"],r:71},{n:"Harold Wallace",pos:["CB","LB"],r:70},
  {n:"Luis Marín",pos:["LB","CB"],r:72},{n:"Daniel Vallejos",pos:["LB"],r:70},
  {n:"Mauricio Solís",pos:["CDM","CM"],r:73},{n:"Walter Centeno",pos:["CM","CAM"],r:74},
  {n:"Rónald Gómez",pos:["CM","LW"],r:72},{n:"Rodrigo Cordero",pos:["CM","CDM"],r:70},
  {n:"Juan José Rodríguez",pos:["CM","CDM"],r:70},{n:"Erick Lonnis",pos:["CM"],r:70},
  {n:"Pablo Chinchilla",pos:["LW","CM"],r:70},{n:"Lester Morgan",pos:["LW","ST"],r:70},
  {n:"Winston Parks",pos:["LW","ST"],r:70},{n:"William Sunsing",pos:["CM","LW"],r:69},
  {n:"Wílmer López",pos:["LW","ST"],r:70},{n:"Rolando Fonseca",pos:["ST"],r:74},
  {n:"Hernán Medford",pos:["ST","CAM"],r:71},{n:"Paulo Wanchope",pos:["ST"],r:78}
 ]}],

 "Ecuador_2002":[{y:2002,p:[
  {n:"José Francisco Cevallos",pos:["GK"],r:74},{n:"Daniel Viteri",pos:["GK"],r:70},{n:"Augusto Porozo",pos:["GK"],r:70},
  {n:"Iván Hurtado",pos:["CB"],r:77},{n:"Giovanny Espinoza",pos:["CB"],r:74},
  {n:"Ángel Fernández",pos:["CB","LB"],r:71},{n:"Alfonso Obregón",pos:["RB","CB"],r:71},
  {n:"Ulises de la Cruz",pos:["RB","RWB"],r:75},{n:"Walter Ayoví",pos:["LB","LWB"],r:72},
  {n:"Álex Aguinaga",pos:["CAM","CM"],r:78},{n:"Marlon Ayoví",pos:["LB","CM"],r:72},
  {n:"Wellington Sánchez",pos:["CM","CDM"],r:70},{n:"Edwin Tenorio",pos:["RB","CM"],r:73},
  {n:"Juan Carlos Burbano",pos:["CM","CDM"],r:70},{n:"Cléber Chalá",pos:["CM"],r:70},
  {n:"Luis Gómez",pos:["CM","LW"],r:70},{n:"Raúl Guerrón",pos:["LW","CM"],r:70},
  {n:"Oswaldo Ibarra",pos:["LW","ST"],r:70},{n:"Nicolás Asencio",pos:["LW","ST"],r:70},
  {n:"Agustín Delgado",pos:["ST"],r:75},{n:"Carlos Tenorio",pos:["ST"],r:73},
  {n:"Iván Kaviedes",pos:["ST","LW"],r:74},{n:"Édison Méndez",pos:["CAM","CM"],r:75}
 ]}],

 "Greece_1994":[{y:1994,p:[
  {n:"Christos Karkamanis",pos:["GK"],r:72},{n:"Ioannis Kalitzakis",pos:["GK"],r:70},{n:"Alexis Alexiou",pos:["GK"],r:70},
  {n:"Stratos Apostolakis",pos:["RB","CB"],r:72},{n:"Stelios Manolas",pos:["CB"],r:73},
  {n:"Alexis Alexoudis",pos:["CB"],r:71},{n:"Tasos Mitropoulos",pos:["CB","LB"],r:70},
  {n:"Antonis Minou",pos:["LB"],r:70},{n:"Kyriakos Karataidis",pos:["RB","CM"],r:70},
  {n:"Nikos Nioplias",pos:["CDM","CM"],r:72},{n:"Elias Atmatsidis",pos:["CM","CDM"],r:70},
  {n:"Savvas Kofidis",pos:["CM","CDM"],r:70},{n:"Minas Hantzidis",pos:["CM"],r:69},
  {n:"Vaios Karagiannis",pos:["CM"],r:69},{n:"Panagiotis Tsalouchidis",pos:["CM","LW"],r:70},
  {n:"Spiros Marangos",pos:["LW","CM"],r:70},{n:"Thanasis Kolitsidakis",pos:["LW","RW"],r:70},
  {n:"Nikos Tsiantakis",pos:["RW","LW"],r:71},{n:"Vasilis Dimitriadis",pos:["ST","LW"],r:70},
  {n:"Alexis Alexandris",pos:["ST","LW"],r:73},{n:"Nikos Machlas",pos:["ST"],r:74},
  {n:"Dimitris Saravakos",pos:["CAM","ST"],r:74}
 ]}],

 "Jamaica_1998":[{y:1998,p:[
  {n:"Warren Barrett",pos:["GK"],r:72},{n:"Donovan Ricketts",pos:["GK"],r:71},{n:"Peter Cargill",pos:["GK"],r:70},
  {n:"Frank Sinclair",pos:["CB"],r:73},{n:"Ian Goodison",pos:["CB"],r:73},
  {n:"Aaron Lawrence",pos:["CB","RB"],r:72},{n:"Linval Dixon",pos:["CB","LB"],r:70},
  {n:"Dean Sewell",pos:["RB","CB"],r:70},{n:"Chris Dawes",pos:["LB"],r:70},
  {n:"Durrant Brown",pos:["CDM","CM"],r:71},{n:"Fitzroy Simpson",pos:["CM","CDM"],r:72},
  {n:"Paul Hall",pos:["CM","LW"],r:72},{n:"Andy Williams",pos:["CM","CDM"],r:70},
  {n:"Darryl Powell",pos:["CM","CDM"],r:71},{n:"Stephen Malcolm",pos:["CM"],r:69},
  {n:"Theodore Whitmore",pos:["CM","CAM"],r:73},{n:"Ricardo Gardner",pos:["LW","LB"],r:74},
  {n:"Marcus Gayle",pos:["LW","ST"],r:72},{n:"Robbie Earle",pos:["CM","ST"],r:73},
  {n:"Onandi Lowe",pos:["ST"],r:71},{n:"Walter Boyd",pos:["LW","ST"],r:71},
  {n:"Deon Burton",pos:["ST","LW"],r:71}
 ]}],

 "Paraguay_1998":[{y:1998,p:[
  {n:"José Luis Chilavert",pos:["GK"],r:83},{n:"Justo Villar",pos:["GK"],r:73},{n:"Danilo Aceval",pos:["GK"],r:70},
  {n:"Denis Caniza",pos:["CB","RB"],r:74},{n:"Carlos Gamarra",pos:["CB"],r:80},
  {n:"Celso Ayala",pos:["CB"],r:75},{n:"Arístides Rojas",pos:["CB","LB"],r:72},
  {n:"Francisco Arce",pos:["LB","LWB"],r:77},{n:"Ricardo Rojas",pos:["LB","CB"],r:70},
  {n:"Roberto Acuña",pos:["CDM","CM"],r:76},{n:"Carlos Paredes",pos:["CM","CDM"],r:75},
  {n:"Edgar Aguilera",pos:["CM","CDM"],r:72},{n:"Carlos Morales",pos:["CM"],r:70},
  {n:"Catalino Rivarola",pos:["CM","CDM"],r:71},{n:"Julio César Enciso",pos:["LW","CM"],r:71},
  {n:"Julio César Yegros",pos:["CM","LW"],r:70},{n:"Pedro Sarabia",pos:["LW","ST"],r:73},
  {n:"Hugo Brizuela",pos:["LW","ST"],r:70},{n:"Miguel Ángel Benítez",pos:["ST","LW"],r:71},
  {n:"Rubén Ruiz Díaz",pos:["ST","LW"],r:71},{n:"José Cardozo",pos:["ST"],r:79},
  {n:"Jorge Luis Campos",pos:["CAM","CM"],r:73}
 ]}],

 "Paraguay_2002":[{y:2002,p:[
  {n:"José Luis Chilavert",pos:["GK"],r:81},{n:"Justo Villar",pos:["GK"],r:74},{n:"Ricardo Tavarelli",pos:["GK"],r:70},
  {n:"Denis Caniza",pos:["CB","RB"],r:74},{n:"Carlos Gamarra",pos:["CB"],r:79},
  {n:"Celso Ayala",pos:["CB"],r:74},{n:"Julio César Cáceres",pos:["CB"],r:73},
  {n:"Francisco Arce",pos:["LB","LWB"],r:76},{n:"Carlos Bonet",pos:["RB"],r:70},
  {n:"Roberto Acuña",pos:["CDM","CM"],r:75},{n:"Carlos Paredes",pos:["CM","CDM"],r:74},
  {n:"Daniel Sanabria",pos:["CM","CDM"],r:71},{n:"Diego Gavilán",pos:["CM","CAM"],r:73},
  {n:"Guido Alvarenga",pos:["CM","LW"],r:70},{n:"Richart Báez",pos:["LW","CM"],r:70},
  {n:"Estanislao Struway",pos:["LW","CM"],r:70},{n:"Pedro Sarabia",pos:["LW","ST"],r:72},
  {n:"Juan Carlos Franco",pos:["CM","LW"],r:71},{n:"Nelson Cuevas",pos:["LW","ST"],r:73},
  {n:"Gustavo Morínigo",pos:["ST"],r:70},{n:"José Cardozo",pos:["ST"],r:78},
  {n:"Jorge Luis Campos",pos:["CAM","CM"],r:72},{n:"Roque Santa Cruz",pos:["ST","LW"],r:78}
 ]}],

 "Poland_2002":[{y:2002,p:[
  {n:"Jerzy Dudek",pos:["GK"],r:82},{n:"Radosław Majdan",pos:["GK"],r:72},{n:"Adam Matysek",pos:["GK"],r:70},
  {n:"Tomasz Kłos",pos:["CB","RB"],r:74},{n:"Tomasz Wałdoch",pos:["CB"],r:74},
  {n:"Tomasz Hajto",pos:["CB"],r:75},{n:"Arkadiusz Głowacki",pos:["CB"],r:72},
  {n:"Jacek Bąk",pos:["LB","CB"],r:73},{n:"Tomasz Rząsa",pos:["LB","CDM"],r:72},
  {n:"Marek Koźmiński",pos:["CDM","CM"],r:72},{n:"Arkadiusz Bąk",pos:["CM","CDM"],r:71},
  {n:"Radosław Kałużny",pos:["CM","CDM"],r:73},{n:"Piotr Świerczewski",pos:["CM","CDM"],r:74},
  {n:"Sven Vermant",pos:["CM","CDM"],r:71},{n:"Paweł Sibik",pos:["CM"],r:70},
  {n:"Cezary Kucharski",pos:["LW","CM"],r:70},{n:"Paweł Kryszałowicz",pos:["LW","ST"],r:72},
  {n:"Jacek Krzynówek",pos:["LW","CM"],r:74},{n:"Maciej Murawski",pos:["CM","LW"],r:70},
  {n:"Jacek Zieliński",pos:["CM"],r:70},{n:"Maciej Żurawski",pos:["ST","LW"],r:74},
  {n:"Marcin Żewłakow",pos:["ST","LW"],r:72},{n:"Emmanuel Olisadebe",pos:["ST"],r:74}
 ]}],

 "Republic_of_Ireland_1994":[{y:1994,p:[
  {n:"Pat Bonner",pos:["GK"],r:77},{n:"Alan Kelly",pos:["GK"],r:76},{n:"Alan Kernaghan",pos:["GK"],r:70},
  {n:"Gary Kelly",pos:["RB","RWB"],r:75},{n:"Paul McGrath",pos:["CB"],r:84},
  {n:"Phil Babb",pos:["CB"],r:77},{n:"Kevin Moran",pos:["CB"],r:73},
  {n:"Denis Irwin",pos:["LB","RB"],r:81},{n:"Terry Phelan",pos:["LB","LWB"],r:73},
  {n:"Eddie McGoldrick",pos:["CM","RB"],r:72},{n:"John Sheridan",pos:["CDM","CM"],r:75},
  {n:"Ray Houghton",pos:["CM","RW"],r:76},{n:"Ronnie Whelan",pos:["CM","CDM"],r:75},
  {n:"Roy Keane",pos:["CM","CDM"],r:84},{n:"Andy Townsend",pos:["CM","CDM"],r:77},
  {n:"Alan McLoughlin",pos:["CM","CAM"],r:73},{n:"Jason McAteer",pos:["CM","RW"],r:74},
  {n:"Steve Staunton",pos:["LB","CM"],r:76},{n:"David Kelly",pos:["ST","LW"],r:71},
  {n:"Tommy Coyne",pos:["ST"],r:71},{n:"John Aldridge",pos:["ST"],r:76},
  {n:"Tony Cascarino",pos:["ST"],r:73}
 ]}],

 "Republic_of_Ireland_2002":[{y:2002,p:[
  {n:"Shay Given",pos:["GK"],r:82},{n:"Dean Kiely",pos:["GK"],r:75},{n:"Alan Kelly",pos:["GK"],r:74},
  {n:"Steve Finnan",pos:["RB","RWB"],r:76},{n:"Gary Breen",pos:["CB"],r:74},
  {n:"Kenny Cunningham",pos:["CB"],r:76},{n:"Richard Dunne",pos:["CB"],r:76},
  {n:"Ian Harte",pos:["LB","LWB"],r:75},{n:"Steve Staunton",pos:["LB","CB"],r:74},
  {n:"Andrew O'Brien",pos:["CB","CDM"],r:72},{n:"Roy Keane",pos:["CM","CDM"],r:87},
  {n:"Mark Kinsella",pos:["CDM","CM"],r:72},{n:"Lee Carsley",pos:["CDM","CM"],r:72},
  {n:"Matt Holland",pos:["CM","CDM"],r:73},{n:"Steven Reid",pos:["CM","RW"],r:72},
  {n:"Jason McAteer",pos:["CM","RW"],r:73},{n:"Gary Kelly",pos:["RB","CM"],r:72},
  {n:"Kevin Kilbane",pos:["LW","LM"],r:74},{n:"Damien Duff",pos:["LW","RW"],r:80},
  {n:"Clinton Morrison",pos:["ST","LW"],r:72},{n:"David Connolly",pos:["ST"],r:72},
  {n:"Niall Quinn",pos:["ST"],r:75},{n:"Robbie Keane",pos:["ST","CAM"],r:80}
 ]}],

 "Romania_1994":[{y:1994,p:[
  {n:"Bogdan Stelea",pos:["GK"],r:78},{n:"Florin Prunea",pos:["GK"],r:74},{n:"Ștefan Preda",pos:["GK"],r:70},
  {n:"Dan Petrescu",pos:["RB","RWB"],r:81},{n:"Miodrag Belodedici",pos:["CB"],r:78},
  {n:"Daniel Prodan",pos:["CB"],r:75},{n:"Gheorghe Mihali",pos:["CB"],r:73},
  {n:"Corneliu Papură",pos:["LB","CB"],r:73},{n:"Basarab Panduru",pos:["LB","RW"],r:74},
  {n:"Ioan Lupescu",pos:["CDM","CM"],r:76},{n:"Dorinel Munteanu",pos:["CM","CDM"],r:78},
  {n:"Tibor Selymes",pos:["CM","CDM"],r:72},{n:"Ion Vlădoiu",pos:["CM","LW"],r:73},
  {n:"Constantin Gâlcă",pos:["CM","CDM"],r:73},{n:"Ovidiu Stîngă",pos:["LW","CM"],r:72},
  {n:"Marian Ivan",pos:["LW","CM"],r:70},{n:"Iulian Chiriță",pos:["CM"],r:70},
  {n:"Ilie Dumitrescu",pos:["CAM","LW"],r:82},{n:"Gheorghe Popescu",pos:["CDM","CB"],r:83},
  {n:"Florin Răducioiu",pos:["ST","LW"],r:78},{n:"Viorel Moldovan",pos:["ST"],r:75},
  {n:"Gheorghe Hagi",pos:["CAM","CM"],r:91}
 ]}],

 "Romania_1998":[{y:1998,p:[
  {n:"Bogdan Stelea",pos:["GK"],r:78},{n:"Florin Prunea",pos:["GK"],r:74},{n:"Marius Lăcătuș",pos:["GK"],r:70},
  {n:"Dan Petrescu",pos:["RB","RWB"],r:80},{n:"Gheorghe Popescu",pos:["CB","CDM"],r:82},
  {n:"Anton Doboș",pos:["CB"],r:70},{n:"Iulian Filipescu",pos:["CB"],r:75},
  {n:"Liviu Ciobotariu",pos:["LB","CB"],r:72},{n:"Lucian Marinescu",pos:["LB"],r:70},
  {n:"Dorinel Munteanu",pos:["CM","CDM"],r:77},{n:"Constantin Gâlcă",pos:["CDM","CM"],r:72},
  {n:"Tibor Selymes",pos:["CM","CDM"],r:71},{n:"Gabriel Popescu",pos:["CM"],r:72},
  {n:"Ovidiu Stîngă",pos:["LW","CM"],r:72},{n:"Dumitru Stângaciu",pos:["CM"],r:70},
  {n:"Cristian Dulca",pos:["LW","CM"],r:70},{n:"Radu Niculescu",pos:["CM","LW"],r:70},
  {n:"Gheorghe Craioveanu",pos:["LW","CAM"],r:73},{n:"Adrian Ilie",pos:["LW","CAM"],r:76},
  {n:"Viorel Moldovan",pos:["ST"],r:75},{n:"Ilie Dumitrescu",pos:["CAM","LW"],r:79},
  {n:"Gheorghe Hagi",pos:["CAM","CM"],r:88}
 ]}],

 "Russia_1994":[{y:1994,p:[
  {n:"Stanislav Cherchesov",pos:["GK"],r:78},{n:"Dmitri Kharine",pos:["GK"],r:76},{n:"Vladislav Ternavsky",pos:["GK"],r:70},
  {n:"Omari Tetradze",pos:["RB","CB"],r:74},{n:"Viktor Onopko",pos:["CB","CDM"],r:81},
  {n:"Sergei Gorlukovich",pos:["CB"],r:76},{n:"Dmitri Khlestov",pos:["CB"],r:74},
  {n:"Dmitri Kuznetsov",pos:["LB","CB"],r:72},{n:"Dmitri Galiamin",pos:["CDM","CM"],r:72},
  {n:"Igor Lediakhov",pos:["CM","CDM"],r:74},{n:"Andrey Pyatnitsky",pos:["CM","CDM"],r:72},
  {n:"Dmitri Popov",pos:["CM","CDM"],r:71},{n:"Igor Korneev",pos:["CM","LW"],r:73},
  {n:"Ilya Tsymbalar",pos:["CAM","CM"],r:76},{n:"Aleksandr Borodyuk",pos:["CM"],r:70},
  {n:"Valeri Karpin",pos:["CM","LW"],r:78},{n:"Vladimir Beschastnykh",pos:["ST","LW"],r:75},
  {n:"Sergei Yuran",pos:["ST","LW"],r:76},{n:"Dmitri Radchenko",pos:["ST"],r:74},
  {n:"Yuri Nikiforov",pos:["CB","CDM"],r:74},{n:"Oleg Salenko",pos:["ST"],r:77},
  {n:"Aleksandr Mostovoi",pos:["CAM","CM"],r:80}
 ]}],

 "Russia_2002":[{y:2002,p:[
  {n:"Ruslan Nigmatullin",pos:["GK"],r:77},{n:"Stanislav Cherchesov",pos:["GK"],r:74},{n:"Aleksandr Filimonov",pos:["GK"],r:73},
  {n:"Dmitri Sennikov",pos:["RB","CB"],r:72},{n:"Viktor Onopko",pos:["CB","CDM"],r:77},
  {n:"Yuri Kovtun",pos:["CB"],r:74},{n:"Yuri Nikiforov",pos:["CB"],r:73},
  {n:"Andrei Solomatin",pos:["LB","CM"],r:71},{n:"Igor Chugainov",pos:["CM","CB"],r:71},
  {n:"Dmitri Alenichev",pos:["CM","CDM"],r:78},{n:"Sergei Semak",pos:["CDM","CM"],r:75},
  {n:"Aleksey Smertin",pos:["CDM","CM"],r:76},{n:"Igor Semshov",pos:["CM","CDM"],r:73},
  {n:"Dmitri Khokhlov",pos:["CM","CAM"],r:73},{n:"Vyacheslav Dayev",pos:["CM","LW"],r:70},
  {n:"Marat Izmailov",pos:["LW","CAM"],r:73},{n:"Valeri Karpin",pos:["CM","LW"],r:75},
  {n:"Ruslan Pimenov",pos:["LW","ST"],r:71},{n:"Dmitri Sychev",pos:["ST","LW"],r:72},
  {n:"Yegor Titov",pos:["CM","CAM"],r:74},{n:"Vladimir Beschastnykh",pos:["ST","LW"],r:74},
  {n:"Aleksandr Kerzhakov",pos:["ST"],r:73},{n:"Aleksandr Mostovoi",pos:["CAM","CM"],r:78}
 ]}],

 "Saudi_Arabia_1994":[{y:1994,p:[
  {n:"Mohamed Al-Deayea",pos:["GK"],r:77},{n:"Fuad Anwar",pos:["GK"],r:70},{n:"Yassir Al-Taifi",pos:["GK"],r:69},
  {n:"Abdullah Sulaiman Zubromawi",pos:["CB","RB"],r:71},{n:"Ahmed Jamil Madani",pos:["CB"],r:71},
  {n:"Fahad Al-Ghesheyan",pos:["CB"],r:70},{n:"Hamzah Idris",pos:["CB","LB"],r:70},
  {n:"Abdullah Al-Dosari",pos:["RB"],r:70},{n:"Awad Al-Anazi",pos:["LB"],r:70},
  {n:"Nawaf Al-Temyat",pos:["CDM","CM"],r:74},{n:"Mohammed Al-Khilaiwi",pos:["CM","CDM"],r:73},
  {n:"Ibrahim Al-Helwah",pos:["CM","CDM"],r:71},{n:"Hamzah Saleh",pos:["CM"],r:70},
  {n:"Saleh Al-Dawod",pos:["CM"],r:70},{n:"Talal Jebreen",pos:["CM","LW"],r:70},
  {n:"Fahad Al-Bishi",pos:["LW","CM"],r:70},{n:"Mohamed Abd Al-Jawad",pos:["LW"],r:70},
  {n:"Fahad Al-Mehallel",pos:["LW","CM"],r:71},{n:"Majed Abdullah",pos:["ST","LW"],r:72},
  {n:"Hussein Al-Sadiq",pos:["ST","LW"],r:70},{n:"Khalid Al-Muwallid",pos:["LW","ST"],r:73},
  {n:"Saeed Al-Owairan",pos:["LW","CAM"],r:76},{n:"Sami Al-Jaber",pos:["ST","LW"],r:74}
 ]}],

 "Saudi_Arabia_1998":[{y:1998,p:[
  {n:"Mohamed Al-Deayea",pos:["GK"],r:78},{n:"Khamis Al-Dosari",pos:["GK"],r:70},{n:"Obeid Al-Dosari",pos:["GK"],r:70},
  {n:"Ahmed Al-Dokhi",pos:["RB","CB"],r:72},{n:"Abdullah Sulaiman Zubromawi",pos:["CB"],r:70},
  {n:"Ibrahim Al-Harbi",pos:["CB"],r:70},{n:"Ibrahim Al-Shahrani",pos:["CB","LB"],r:71},
  {n:"Nawaf Al-Temyat",pos:["CDM","CM"],r:74},{n:"Ahmed Jamil Madani",pos:["CM","CB"],r:70},
  {n:"Fuad Anwar",pos:["CM","CDM"],r:70},{n:"Hussein Abdulghani",pos:["CM","CDM"],r:71},
  {n:"Mohammed Al-Khilaiwi",pos:["CM","CDM"],r:73},{n:"Mohammed Al-Jahani",pos:["CM"],r:70},
  {n:"Abdulaziz Al-Janoubi",pos:["CM","LW"],r:70},{n:"Tisir Al-Antaif",pos:["LW","CM"],r:70},
  {n:"Yousuf Al-Thunayan",pos:["LW","CM"],r:70},{n:"Hamzah Saleh",pos:["CM"],r:69},
  {n:"Hussein Al-Sadiq",pos:["LW","ST"],r:70},{n:"Fahad Al-Mehallel",pos:["LW","ST"],r:70},
  {n:"Saeed Al-Owairan",pos:["LW","CAM"],r:74},{n:"Khalid Al-Muwallid",pos:["ST","LW"],r:73},
  {n:"Sami Al-Jaber",pos:["ST","LW"],r:75}
 ]}],

 "Saudi_Arabia_2002":[{y:2002,p:[
  {n:"Mohamed Al-Deayea",pos:["GK"],r:77},{n:"Abdullah Al-Waked",pos:["GK"],r:70},{n:"Khamis Al-Dosari",pos:["GK"],r:70},
  {n:"Ahmed Al-Dokhi",pos:["CB","RB"],r:71},{n:"Abdulaziz Al-Khathran",pos:["CM","CB"],r:70},
  {n:"Abdullah Al-Jumaan",pos:["CB"],r:70},{n:"Ibrahim Al-Shahrani",pos:["CB","LB"],r:71},
  {n:"Abdullah Sulaiman Zubromawi",pos:["CB"],r:70},{n:"Obeid Al-Dosari",pos:["LB","CB"],r:69},
  {n:"Nawaf Al-Temyat",pos:["CDM","CM"],r:73},{n:"Mansour Al-Thagafi",pos:["CM","CDM"],r:70},
  {n:"Al Hasan Al-Yami",pos:["CM","CDM"],r:70},{n:"Mohsin Al-Harthi",pos:["CM"],r:69},
  {n:"Hussein Abdulghani",pos:["CM","LW"],r:70},{n:"Omar Al-Ghamdi",pos:["LB","CM"],r:70},
  {n:"Fouzi Al-Shehri",pos:["CM","LW"],r:70},{n:"Mohammad Al-Shalhoub",pos:["CM","CAM"],r:71},
  {n:"Mohammed Al-Jahani",pos:["LW","ST"],r:70},{n:"Mabrouk Zaid",pos:["LW","CM"],r:69},
  {n:"Mohammed Al-Khojali",pos:["LW","CM"],r:70},{n:"Redha Tukar",pos:["LW","RW"],r:70},
  {n:"Mohammed Noor",pos:["LW","ST"],r:70},{n:"Sami Al-Jaber",pos:["ST","LW"],r:75}
 ]}],

 "Scotland_1998":[{y:1998,p:[
  {n:"Jim Leighton",pos:["GK"],r:75},{n:"Jonathan Gould",pos:["GK"],r:73},{n:"Neil Sullivan",pos:["GK"],r:74},
  {n:"Colin Hendry",pos:["CB"],r:77},{n:"Colin Calderwood",pos:["CB"],r:73},
  {n:"Derek Whyte",pos:["CB"],r:72},{n:"David Weir",pos:["CB"],r:75},
  {n:"Tom Boyd",pos:["LB","CB"],r:73},{n:"Tosh McKinlay",pos:["LB","LWB"],r:72},
  {n:"Jackie McNamara",pos:["RB","CM"],r:73},{n:"Paul Lambert",pos:["CDM","CM"],r:76},
  {n:"Billy McKinlay",pos:["CM","CDM"],r:72},{n:"Christian Dailly",pos:["CB","CM"],r:72},
  {n:"Scot Gemmill",pos:["CM","CDM"],r:71},{n:"Matt Elliott",pos:["CB"],r:73},
  {n:"John Collins",pos:["CM","CAM"],r:78},{n:"Kevin Gallacher",pos:["LW","ST"],r:74},
  {n:"Darren Jackson",pos:["LW","ST"],r:72},{n:"Simon Donnelly",pos:["LW","ST"],r:71},
  {n:"Craig Burley",pos:["CM","CDM"],r:75},{n:"Scott Booth",pos:["ST","LW"],r:71},
  {n:"Gordon Durie",pos:["ST","LW"],r:73}
 ]}],

 "Slovenia_2002":[{y:2002,p:[
  {n:"Saša Gajser",pos:["GK"],r:72},{n:"Aleksander Knavs",pos:["GK"],r:71},{n:"Rajko Tavčar",pos:["GK"],r:70},
  {n:"Marinko Galič",pos:["RB","CB"],r:71},{n:"Mladen Rudonja",pos:["CB","LB"],r:72},
  {n:"Marko Simeunovič",pos:["CB"],r:71},{n:"Amir Karić",pos:["CB"],r:70},
  {n:"Spasoje Bulajič",pos:["LB","CB"],r:70},{n:"Goran Sankovič",pos:["LB"],r:69},
  {n:"Milenko Ačimovič",pos:["CM","CAM"],r:74},{n:"Džoni Novak",pos:["CDM","CM"],r:70},
  {n:"Nastja Čeh",pos:["CM","CDM"],r:71},{n:"Aleš Čeh",pos:["CM"],r:70},
  {n:"Miran Pavlin",pos:["CM","CDM"],r:70},{n:"Dejan Nemec",pos:["CM"],r:70},
  {n:"Muamer Vugdalić",pos:["CM","LW"],r:70},{n:"Sebastjan Cimirotič",pos:["LW","CM"],r:72},
  {n:"Senad Tiganj",pos:["CM","LW"],r:70},{n:"Mladen Dabanovič",pos:["LW","ST"],r:70},
  {n:"Milan Osterc",pos:["LW","ST"],r:71},{n:"Zoran Pavlović",pos:["ST"],r:70},
  {n:"Željko Milinovič",pos:["ST","LW"],r:70},{n:"Zlatko Zahovič",pos:["CAM","LW"],r:78}
 ]}],

 "South_Africa_1998":[{y:1998,p:[
  {n:"Hans Vonk",pos:["GK"],r:73},{n:"Brian Baloyi",pos:["GK"],r:72},{n:"Brendan Augustine",pos:["GK"],r:70},
  {n:"David Nyathi",pos:["RB","CB"],r:71},{n:"Lucas Radebe",pos:["CB"],r:80},
  {n:"Mark Fish",pos:["CB"],r:76},{n:"Pierre Issa",pos:["CB"],r:73},
  {n:"Helman Mkhalele",pos:["LB","LWB"],r:72},{n:"Willem Jackson",pos:["LB","CB"],r:70},
  {n:"Simon Gopane",pos:["CDM","CM"],r:70},{n:"Alfred Phiri",pos:["CM","CDM"],r:70},
  {n:"John Moshoeu",pos:["CM","CAM"],r:74},{n:"Doctor Khumalo",pos:["CAM","CM"],r:74},
  {n:"Paul Evans",pos:["CM","CDM"],r:70},{n:"Lebogang Morula",pos:["CM"],r:70},
  {n:"William Mokoena",pos:["CM","LW"],r:70},{n:"Jerry Sikhosana",pos:["LW","ST"],r:71},
  {n:"Themba Mnguni",pos:["LW","CM"],r:70},{n:"Shaun Bartlett",pos:["ST","LW"],r:74},
  {n:"Phil Masinga",pos:["ST"],r:73},{n:"Quinton Fortune",pos:["LW","CAM"],r:76},
  {n:"Delron Buckley",pos:["LW","ST"],r:72},{n:"Benni McCarthy",pos:["ST"],r:77}
 ]}],

 "South_Africa_2002":[{y:2002,p:[
  {n:"Hans Vonk",pos:["GK"],r:71},{n:"Andre Arendse",pos:["GK"],r:73},{n:"Calvin Marlin",pos:["GK"],r:70},
  {n:"Aaron Mokoena",pos:["CB","CDM"],r:74},{n:"Lucas Radebe",pos:["CB"],r:78},
  {n:"Pierre Issa",pos:["CB"],r:72},{n:"Jacob Lekgetho",pos:["CB","LB"],r:70},
  {n:"Bradley Carnell",pos:["LB","CB"],r:72},{n:"Teboho Mokoena",pos:["LB","CM"],r:70},
  {n:"MacBeth Sibaya",pos:["CDM","CM"],r:73},{n:"Bennett Mnguni",pos:["CM","CDM"],r:70},
  {n:"MacDonald Mukansi",pos:["CM","CDM"],r:70},{n:"Cyril Nzama",pos:["CM"],r:69},
  {n:"Thabang Molefe",pos:["CM"],r:69},{n:"Thabo Mngomeni",pos:["CM","LW"],r:70},
  {n:"Jabu Pule",pos:["LW","CAM"],r:74},{n:"Sibusiso Zuma",pos:["LW","ST"],r:73},
  {n:"Delron Buckley",pos:["LW","ST"],r:73},{n:"George Koumantarakis",pos:["ST"],r:72},
  {n:"Siyabonga Nomvethe",pos:["ST","LW"],r:71},{n:"Steven Pienaar",pos:["CM","LW"],r:76},
  {n:"Quinton Fortune",pos:["LW","CAM"],r:75},{n:"Benni McCarthy",pos:["ST"],r:78}
 ]}],

 "Switzerland_1994":[{y:1994,p:[
  {n:"Marco Pascolo",pos:["GK"],r:76},{n:"Jürg Studer",pos:["GK"],r:72},{n:"Martin Brunner",pos:["GK"],r:70},
  {n:"Marc Hottiger",pos:["RB","RWB"],r:75},{n:"Dominique Herr",pos:["CB"],r:73},
  {n:"Alain Geiger",pos:["CB"],r:74},{n:"André Egli",pos:["CB"],r:73},
  {n:"Martin Rueda",pos:["LB","CB"],r:72},{n:"Nestor Subiat",pos:["LB"],r:70},
  {n:"Thomas Bickel",pos:["CDM","CM"],r:73},{n:"Ciriaco Sforza",pos:["CM","CDM"],r:76},
  {n:"Georges Bregy",pos:["CM","CDM"],r:72},{n:"Alain Sutter",pos:["CM","LW"],r:73},
  {n:"Patrick Sylvestre",pos:["CM","CDM"],r:70},{n:"Thomas Wyss",pos:["CM"],r:70},
  {n:"Yvan Quentin",pos:["CM","LW"],r:70},{n:"Christophe Ohrel",pos:["LW","RW"],r:72},
  {n:"Adrian Knup",pos:["LW","ST"],r:74},{n:"Sébastien Fournier",pos:["CM","LW"],r:70},
  {n:"Marco Grassi",pos:["ST","LW"],r:72},{n:"Stephan Lehmann",pos:["ST"],r:71},
  {n:"Stéphane Chapuisat",pos:["ST"],r:82}
 ]}],

 "Tunisia_1998":[{y:1998,p:[
  {n:"Chokri El Ouaer",pos:["GK"],r:74},{n:"Ali Boumnijel",pos:["GK"],r:75},{n:"Mounir Boukadida",pos:["GK"],r:70},
  {n:"Hatem Trabelsi",pos:["RB","RWB"],r:75},{n:"Radhouane Salhi",pos:["CB"],r:71},
  {n:"Riadh Jelassi",pos:["CB"],r:71},{n:"Skander Souayah",pos:["CB","LB"],r:70},
  {n:"Faysal Ben Ahmed",pos:["LB","CB"],r:70},{n:"Ferid Chouchane",pos:["RB","CM"],r:70},
  {n:"Riadh Bouazizi",pos:["CDM","CM"],r:72},{n:"Kaies Ghodhbane",pos:["CM","CDM"],r:70},
  {n:"Mehdi Ben Slimane",pos:["CM","CDM"],r:70},{n:"Sami Trabelsi",pos:["CM","CDM"],r:70},
  {n:"Imed Ben Younes",pos:["CM"],r:70},{n:"José Clayton",pos:["CM","CDM"],r:70},
  {n:"Tarek Thabet",pos:["LW","CM"],r:70},{n:"Sabri Jaballah",pos:["LW","ST"],r:70},
  {n:"Sirajeddine Chihi",pos:["LW","RW"],r:70},{n:"Khaled Badra",pos:["CB","CM"],r:71},
  {n:"Mourad Melki",pos:["LW","CAM"],r:71},{n:"Zoubeir Baya",pos:["ST","LW"],r:70},
  {n:"Adel Sellimi",pos:["LW","ST"],r:74}
 ]}],

 "Tunisia_2002":[{y:2002,p:[
  {n:"Ali Boumnijel",pos:["GK"],r:75},{n:"Hassen Gabsi",pos:["GK"],r:71},{n:"Hassen Bejaoui",pos:["GK"],r:70},
  {n:"Hatem Trabelsi",pos:["RB","RWB"],r:75},{n:"Kaies Ghodhbane",pos:["CM","CDM"],r:71},
  {n:"Khaled Badra",pos:["CB"],r:71},{n:"Ali Zitouni",pos:["CB","LB"],r:70},
  {n:"Riadh Jelassi",pos:["CB","LB"],r:70},{n:"Hamdi Marzouki",pos:["LB","CB"],r:70},
  {n:"Riadh Bouazizi",pos:["CDM","CM"],r:72},{n:"José Clayton",pos:["CM","CDM"],r:71},
  {n:"Selim Benachour",pos:["CM","CDM"],r:70},{n:"Mohamed Mkacher",pos:["CM"],r:70},
  {n:"Imed Mhedhebi",pos:["CM"],r:70},{n:"Mourad Melki",pos:["LW","CAM"],r:71},
  {n:"Emir Mkademi",pos:["CM","LW"],r:70},{n:"Ahmed El-Jaouachi",pos:["LW","ST"],r:70},
  {n:"Raouf Bouzaiene",pos:["ST","LW"],r:71},{n:"Tarek Thabet",pos:["LW","CM"],r:71},
  {n:"Ziad Jaziri",pos:["ST","LW"],r:72},{n:"Zoubeir Baya",pos:["ST"],r:70},
  {n:"Adel Sellimi",pos:["LW","ST"],r:73}
 ]}],

 "United_States_1994":[{y:1994,p:[
  {n:"Tony Meola",pos:["GK"],r:78},{n:"Juergen Sommer",pos:["GK"],r:74},{n:"Brad Friedel",pos:["GK"],r:74},
  {n:"Cle Kooiman",pos:["CB","RB"],r:72},{n:"Marcelo Balboa",pos:["CB"],r:75},
  {n:"Paul Caligiuri",pos:["CB","CM"],r:73},{n:"Alexi Lalas",pos:["CB"],r:74},
  {n:"Mike Burns",pos:["RB","CM"],r:72},{n:"Mike Lapper",pos:["LB","CB"],r:71},
  {n:"John Harkes",pos:["CM","CDM"],r:74},{n:"Mike Sorber",pos:["CDM","CM"],r:72},
  {n:"Fernando Clavijo",pos:["CDM","CM"],r:72},{n:"Claudio Reyna",pos:["CM","CAM"],r:75},
  {n:"Frank Klopas",pos:["CM","LW"],r:72},{n:"Hugo Pérez",pos:["CAM","CM"],r:72},
  {n:"Tab Ramos",pos:["CAM","CM"],r:74},{n:"Thomas Dooley",pos:["CM","CDM"],r:74},
  {n:"Cobi Jones",pos:["LW","RW"],r:74},{n:"Eric Wynalda",pos:["LW","ST"],r:76},
  {n:"Joe-Max Moore",pos:["LW","ST"],r:74},{n:"Roy Wegerle",pos:["ST","LW"],r:72},
  {n:"Earnie Stewart",pos:["LW","ST"],r:74}
 ]}],

 "United_States_1998":[{y:1998,p:[
  {n:"Kasey Keller",pos:["GK"],r:79},{n:"Juergen Sommer",pos:["GK"],r:72},{n:"Brad Friedel",pos:["GK"],r:77},
  {n:"Frankie Hejduk",pos:["RB","RWB"],r:74},{n:"Alexi Lalas",pos:["CB"],r:74},
  {n:"Jeff Agoos",pos:["CB","CDM"],r:73},{n:"Eddie Pope",pos:["CB"],r:74},
  {n:"Marcelo Balboa",pos:["CB"],r:74},{n:"Mike Burns",pos:["RB","CM"],r:71},
  {n:"David Regis",pos:["LB","CB"],r:71},{n:"Thomas Dooley",pos:["CM","CDM"],r:73},
  {n:"Tab Ramos",pos:["CAM","CM"],r:73},{n:"Brian Maisonneuve",pos:["CM","CDM"],r:70},
  {n:"Chad Deering",pos:["CM"],r:69},{n:"Eric Wynalda",pos:["LW","ST"],r:74},
  {n:"Claudio Reyna",pos:["CM","CAM"],r:76},{n:"Cobi Jones",pos:["LW","RW"],r:73},
  {n:"Roy Wegerle",pos:["ST","LW"],r:71},{n:"Earnie Stewart",pos:["LW","ST"],r:73},
  {n:"Brian McBride",pos:["ST"],r:75},{n:"Joe-Max Moore",pos:["LW","ST"],r:72},
  {n:"Predrag Radosavljević",pos:["CDM","CM"],r:72}
 ]}],

 "United_States_2002":[{y:2002,p:[
  {n:"Kasey Keller",pos:["GK"],r:80},{n:"Tony Meola",pos:["GK"],r:74},{n:"Brad Friedel",pos:["GK"],r:78},
  {n:"Steve Cherundolo",pos:["RB","CB"],r:74},{n:"Eddie Pope",pos:["CB"],r:75},
  {n:"Gregg Berhalter",pos:["CB"],r:73},{n:"Carlos Llamosa",pos:["CB"],r:71},
  {n:"Jeff Agoos",pos:["CB","CDM"],r:72},{n:"David Regis",pos:["LB","CB"],r:70},
  {n:"Frankie Hejduk",pos:["RB","LB"],r:73},{n:"Tony Sanneh",pos:["RB","CB"],r:71},
  {n:"Pablo Mastroeni",pos:["CDM","CM"],r:73},{n:"Josh Wolff",pos:["LW","ST"],r:71},
  {n:"John O'Brien",pos:["CM","CDM"],r:73},{n:"Clint Mathis",pos:["ST","LW"],r:73},
  {n:"Claudio Reyna",pos:["CM","CAM"],r:77},{n:"Eddie Lewis",pos:["LW","LM"],r:72},
  {n:"Cobi Jones",pos:["LW","RW"],r:73},{n:"Joe-Max Moore",pos:["LW","ST"],r:72},
  {n:"Earnie Stewart",pos:["LW","ST"],r:73},{n:"Brian McBride",pos:["ST"],r:76},
  {n:"DaMarcus Beasley",pos:["LW","CM"],r:74},{n:"Landon Donovan",pos:["LW","CAM"],r:79}
 ]}],

 "Yugoslavia_1998":[{y:1998,p:[
  {n:"Ivica Kralj",pos:["GK"],r:75},{n:"Dragoje Leković",pos:["GK"],r:73},{n:"Željko Petrović",pos:["GK"],r:70},
  {n:"Zoran Mirković",pos:["RB","CB"],r:73},{n:"Goran Đorović",pos:["CB"],r:73},
  {n:"Niša Saveljić",pos:["CB"],r:77},{n:"Miroslav Đukić",pos:["CB"],r:74},
  {n:"Slobodan Komljenović",pos:["LB","CB"],r:72},{n:"Ljubinko Drulović",pos:["LB","LWB"],r:74},
  {n:"Slaviša Jokanović",pos:["CDM","CM"],r:76},{n:"Vladimir Jugović",pos:["CM","CDM"],r:76},
  {n:"Siniša Mihajlović",pos:["LB","CDM"],r:82},{n:"Branko Brnović",pos:["CM","CDM"],r:71},
  {n:"Dejan Govedarica",pos:["LB","CM"],r:71},{n:"Miroslav Stević",pos:["CM"],r:70},
  {n:"Ognjen Kovačević",pos:["CM","LW"],r:69},{n:"Perica Ognjenović",pos:["LW","CM"],r:70},
  {n:"Darko Kovačević",pos:["ST","LW"],r:75},{n:"Dejan Stanković",pos:["CM","CAM"],r:79},
  {n:"Savo Milošević",pos:["ST"],r:76},{n:"Predrag Mijatović",pos:["ST","LW"],r:80},
  {n:"Dragan Stojković",pos:["CAM","CM"],r:82},{n:"Dejan Savićević",pos:["CAM","LW"],r:83}
 ]}],

 "Iran_1998":[{y:1998,p:[
  {n:"Ahmad Reza Abedzadeh",pos:["GK"],r:76},{n:"Afshin Peyrovani",pos:["GK"],r:72},{n:"Mehdi Pashazadeh",pos:["GK"],r:70},
  {n:"Ali Akbar Ostad-Asadi",pos:["RB","CB"],r:72},{n:"Nader Mohammadkhani",pos:["CB"],r:73},
  {n:"Parviz Boroumand",pos:["CB"],r:71},{n:"Reza Shahroudi",pos:["CB","LB"],r:71},
  {n:"Mehrdad Minavand",pos:["LB","LWB"],r:74},{n:"Sattar Hamedani",pos:["LB","CB"],r:70},
  {n:"Sirous Dinmohammadi",pos:["CDM","CM"],r:71},{n:"Mohammad Khakpour",pos:["CM","CDM"],r:70},
  {n:"Behnam Seraj",pos:["CM","CDM"],r:70},{n:"Ali Latifi",pos:["CM","CDM"],r:70},
  {n:"Alireza Mansourian",pos:["CM","CAM"],r:72},{n:"Naeim Saadavi",pos:["CM"],r:70},
  {n:"Nima Nakisa",pos:["CM","LW"],r:70},{n:"Javad Zarincheh",pos:["LW","CM"],r:70},
  {n:"Mehdi Mahdavikia",pos:["RW","CM"],r:76},{n:"Hamid Estili",pos:["LW","ST"],r:73},
  {n:"Khodadad Azizi",pos:["LW","ST"],r:74},{n:"Karim Bagheri",pos:["CAM","CM"],r:77},
  {n:"Ali Daei",pos:["ST"],r:81}
 ]}],

 "Norway_1994":[{y:1994,p:[
  {n:"Erik Thorstvedt",pos:["GK"],r:78},{n:"Frode Grodås",pos:["GK"],r:75},{n:"Gøran Sørloth",pos:["GK"],r:70},
  {n:"Gunnar Halle",pos:["RB","CB"],r:74},{n:"Rune Bratseth",pos:["CB"],r:78},
  {n:"Henning Berg",pos:["CB","RB"],r:79},{n:"Erland Johnsen",pos:["CB","LB"],r:73},
  {n:"Roger Nilsen",pos:["LB","CB"],r:73},{n:"Stig Inge Bjørnebye",pos:["LB","LWB"],r:75},
  {n:"Ola By Rise",pos:["CDM","CM"],r:71},{n:"Roar Strand",pos:["CM","CDM"],r:72},
  {n:"Lars Bohinen",pos:["CM","CAM"],r:76},{n:"Kjetil Rekdal",pos:["CM","CDM"],r:75},
  {n:"Mini Jakobsen",pos:["CM","LW"],r:71},{n:"Dan Eggen",pos:["CM","CB"],r:73},
  {n:"Erik Mykland",pos:["LW","CAM"],r:74},{n:"Karl Petter Løken",pos:["LW","CM"],r:71},
  {n:"Øyvind Leonhardsen",pos:["CM","LW"],r:75},{n:"Sigurd Rushfeldt",pos:["ST","LW"],r:73},
  {n:"Gøran Sørloth",pos:["ST"],r:70},{n:"Jostein Flo",pos:["ST"],r:74},
  {n:"Jan Åge Fjørtoft",pos:["ST"],r:75}
 ]}],

 "Norway_1998":[{y:1998,p:[
  {n:"Frode Grodås",pos:["GK"],r:74},{n:"Thomas Myhre",pos:["GK"],r:76},{n:"Espen Baardsen",pos:["GK"],r:72},
  {n:"Gunnar Halle",pos:["RB","CB"],r:73},{n:"Henning Berg",pos:["CB","RB"],r:80},
  {n:"Dan Eggen",pos:["CB"],r:73},{n:"Ronny Johnsen",pos:["CB"],r:78},
  {n:"Stig Inge Bjørnebye",pos:["LB","LWB"],r:75},{n:"Vegard Heggem",pos:["RB","LB"],r:74},
  {n:"Mini Jakobsen",pos:["CDM","CM"],r:71},{n:"Roar Strand",pos:["CM","CDM"],r:72},
  {n:"Kjetil Rekdal",pos:["CM","CDM"],r:74},{n:"Ståle Solbakken",pos:["CM"],r:72},
  {n:"Vidar Riseth",pos:["CB","CM"],r:73},{n:"Erik Hoftun",pos:["CM","CDM"],r:70},
  {n:"Erik Mykland",pos:["LW","CAM"],r:74},{n:"Øyvind Leonhardsen",pos:["CM","LW"],r:75},
  {n:"Håvard Flo",pos:["LW","ST"],r:72},{n:"Egil Østenstad",pos:["ST"],r:72},
  {n:"Jostein Flo",pos:["ST"],r:73},{n:"Tore André Flo",pos:["ST","LW"],r:78},
  {n:"Ole Gunnar Solskjær",pos:["ST","LW"],r:82}
 ]}],

 "Bulgaria_1986":[{y:1986,p:[
  {n:"Borislav Mihaylov",pos:["GK"],r:78},{n:"Plamen Getov",pos:["GK"],r:71},{n:"Radoslav Zdravkov",pos:["GK"],r:70},
  {n:"Boycho Velichkov",pos:["RB","CB"],r:72},{n:"Aleksandar Markov",pos:["CB"],r:73},
  {n:"Plamen Markov",pos:["CB"],r:72},{n:"Zhivko Gospodinov",pos:["CB","LB"],r:71},
  {n:"Vasil Dragolov",pos:["LB","CB"],r:70},{n:"Andrey Zhelyazkov",pos:["LB"],r:70},
  {n:"Hristo Kolev",pos:["CDM","CM"],r:71},{n:"Georgi Yordanov",pos:["CM","CDM"],r:70},
  {n:"Kostadin Kostadinov",pos:["CM","CDM"],r:72},{n:"Iliya Valov",pos:["CM"],r:70},
  {n:"Georgi Dimitrov",pos:["CM","CAM"],r:71},{n:"Iliya Dyakov",pos:["LW","CM"],r:70},
  {n:"Nikolay Arabov",pos:["LW","CM"],r:70},{n:"Petar Petrov",pos:["LW","RW"],r:71},
  {n:"Bozhidar Iskrenov",pos:["LW","ST"],r:71},{n:"Atanas Pashev",pos:["ST"],r:70},
  {n:"Stoycho Mladenov",pos:["ST","LW"],r:71},{n:"Ayan Sadakov",pos:["CM","CDM"],r:71},
  {n:"Nasko Sirakov",pos:["LW","ST"],r:76}
 ]}],

 "Canada_1986":[{y:1986,p:[
  {n:"Tino Lettieri",pos:["GK"],r:73},{n:"Paul Dolan",pos:["GK"],r:70},{n:"Sven Habermann",pos:["GK"],r:70},
  {n:"Bob Lenarduzzi",pos:["RB","CB"],r:73},{n:"Randy Samuel",pos:["CB"],r:72},
  {n:"Bruce Wilson",pos:["CB"],r:72},{n:"Ian Bridge",pos:["CB","LB"],r:71},
  {n:"Colin Miller",pos:["LB","CB"],r:71},{n:"Greg Ion",pos:["LB"],r:70},
  {n:"Paul James",pos:["CDM","CM"],r:70},{n:"Randy Ragan",pos:["CM","CDM"],r:70},
  {n:"David Norman",pos:["CM","CDM"],r:70},{n:"Jamie Lowery",pos:["CM"],r:70},
  {n:"Pasquale De Luca",pos:["CM","LW"],r:70},{n:"Terry Moore",pos:["LW","CM"],r:70},
  {n:"Mike Sweeney",pos:["LW","CM"],r:70},{n:"Gerry Gray",pos:["LW","RW"],r:70},
  {n:"George Pakos",pos:["LW","ST"],r:71},{n:"Igor Vrablic",pos:["LW","ST"],r:70},
  {n:"Carl Valentine",pos:["LW","CM"],r:72},{n:"Branko Šegota",pos:["ST","LW"],r:72},
  {n:"Dale Mitchell",pos:["ST","LW"],r:72}
 ]}],

 "Chile_1982":[{y:1982,p:[
  {n:"Mario Osbén",pos:["GK"],r:74},{n:"Oscar Wirth",pos:["GK"],r:71},{n:"Gustavo Moscoso",pos:["GK"],r:69},
  {n:"Carlos Rivas",pos:["RB","CB"],r:71},{n:"Elías Figueroa",pos:["CB"],r:80},
  {n:"Eduardo Bonvallet",pos:["CB"],r:72},{n:"Lizardo Garrido",pos:["CB","LB"],r:70},
  {n:"Enzo Escobar",pos:["LB","CB"],r:70},{n:"Raúl Ormeño",pos:["LB"],r:70},
  {n:"Manuel Rojas",pos:["CDM","CM"],r:72},{n:"Marco Cornez",pos:["CM","CDM"],r:70},
  {n:"Miguel Ángel Neira",pos:["CM","CDM"],r:71},{n:"Vladimir Bigorra",pos:["CM"],r:70},
  {n:"Mario Galindo",pos:["CM","LW"],r:70},{n:"Patricio Yáñez",pos:["LW","CM"],r:73},
  {n:"René Valenzuela",pos:["CM","LW"],r:70},{n:"Oscar Rojas",pos:["LW","RW"],r:70},
  {n:"Mario Soto",pos:["LW","ST"],r:71},{n:"Miguel Ángel Gamboa",pos:["LW","ST"],r:70},
  {n:"Juan Carlos Letelier",pos:["ST","LW"],r:71},{n:"Rodolfo Dubó",pos:["ST"],r:70},
  {n:"Carlos Caszely",pos:["ST"],r:78}
 ]}],

 "Costa_Rica_1990":[{y:1990,p:[
  {n:"Luis Gabelo Conejo",pos:["GK"],r:75},{n:"José Jaikel",pos:["GK"],r:71},{n:"Vladimir Quesada",pos:["GK"],r:70},
  {n:"Claudio Jara",pos:["RB","CB"],r:71},{n:"Héctor Marchena",pos:["CB"],r:72},
  {n:"Mauricio Montero",pos:["CB"],r:71},{n:"Marvin Obando",pos:["CB","LB"],r:70},
  {n:"Roy Myers",pos:["LB","CB"],r:70},{n:"Rónald Marín",pos:["LB"],r:70},
  {n:"Geovanny Jara",pos:["CDM","CM"],r:71},{n:"Rónald González Brenes",pos:["CM","CDM"],r:71},
  {n:"Alexandre Guimarães",pos:["CM","CDM"],r:73},{n:"Hermidio Barrantes",pos:["CM"],r:70},
  {n:"José Carlos Chaves",pos:["CM"],r:70},{n:"Róger Flores",pos:["CM","LW"],r:70},
  {n:"Miguel Segura",pos:["LW","CM"],r:70},{n:"Miguel Davis",pos:["LW","CM"],r:70},
  {n:"Germán Chavarría",pos:["LW","ST"],r:70},{n:"Juan Cayasso",pos:["LW","ST"],r:72},
  {n:"Róger Gómez",pos:["ST","LW"],r:71},{n:"Oscar Ramírez",pos:["CM","CAM"],r:73},
  {n:"Hernán Medford",pos:["LW","ST"],r:73}
 ]}],

 "Egypt_1990":[{y:1990,p:[
  {n:"Ahmed Shobair",pos:["GK"],r:73},{n:"Ayman Taher",pos:["GK"],r:71},{n:"Magdy Tolba",pos:["GK"],r:70},
  {n:"Tarek Soliman",pos:["RB","CB"],r:71},{n:"Hesham Yakan",pos:["CB"],r:71},
  {n:"Gamal Abdel-Hamid",pos:["CB"],r:71},{n:"Ahmed El-Kass",pos:["CB","LB"],r:70},
  {n:"Adel Abdel Rahman",pos:["LB","CB"],r:70},{n:"Thabet El-Batal",pos:["CDM","CM"],r:70},
  {n:"Ashraf Kasem",pos:["CM","CDM"],r:70},{n:"Ahmed Ramzy",pos:["CM","CDM"],r:72},
  {n:"Ibrahim Hassan",pos:["CM","CDM"],r:71},{n:"Magdi Abdelghani",pos:["CM","CAM"],r:72},
  {n:"Taher Abouzeid",pos:["CM","LW"],r:70},{n:"Ayman Shawky",pos:["LW","CM"],r:70},
  {n:"Saber Eid",pos:["LW","CM"],r:70},{n:"Rabie Yassin",pos:["LW","RW"],r:70},
  {n:"Alaa Maihoub",pos:["LW","ST"],r:71},{n:"Osama Orabi",pos:["ST","LW"],r:70},
  {n:"Ismail Youssef",pos:["ST","LW"],r:70},{n:"Hany Ramzy",pos:["CB","CM"],r:74},
  {n:"Hossam Hassan",pos:["ST"],r:78}
 ]}],

 "El_Salvador_1982":[{y:1982,p:[
  {n:"Luis Guevara Mora",pos:["GK"],r:70},{n:"Carlos Recinos",pos:["GK"],r:69},{n:"Jorge González",pos:["CB"],r:70},
  {n:"Francisco Osorto",pos:["CB","RB"],r:70},{n:"Norberto Huezo",pos:["CB","LB"],r:70},
  {n:"Mauricio Alfaro",pos:["LB","CB"],r:69},{n:"Luis Ramírez Zapata",pos:["CDM","CM"],r:70},
  {n:"Ramón Fagoaga",pos:["CM","CDM"],r:69},{n:"José Luis Rugamas",pos:["CM"],r:69},
  {n:"Silvio Aquino",pos:["CM","LW"],r:69},{n:"Ever Hernández",pos:["CM","LW"],r:69},
  {n:"Eduardo Hernández",pos:["LW","ST"],r:70},{n:"Mario Castillo",pos:["LW","ST"],r:70},
  {n:"Joaquín Ventura",pos:["ST","LW"],r:69},{n:"José Francisco Jovel",pos:["ST","LW"],r:70},
  {n:"Miguel Ángel Díaz",pos:["ST"],r:70},{n:"Jaime Rodríguez",pos:["RW","LW"],r:69},
  {n:"José Luis Munguía",pos:["CM"],r:69},{n:"José María Rivas",pos:["LW","CM"],r:69},
  {n:"Guillermo Ragazzone",pos:["ST"],r:70}
 ]}],

 "Honduras_1982":[{y:1982,p:[
  {n:"José Luis Munguía",pos:["GK"],r:71},{n:"Roberto Bailey",pos:["GK"],r:70},{n:"Jimmy Steward",pos:["GK"],r:69},
  {n:"Antonio Laing",pos:["RB","CB"],r:70},{n:"Armando Betancourt",pos:["CB"],r:70},
  {n:"Carlos Caballero",pos:["CB"],r:70},{n:"David Buezo",pos:["CB","LB"],r:70},
  {n:"Gilberto Yearwood",pos:["LB","CB"],r:69},{n:"Roberto Figueroa",pos:["LB"],r:69},
  {n:"Efraín Gutiérrez",pos:["CDM","CM"],r:70},{n:"Ramón Maradiaga",pos:["CM","CDM"],r:71},
  {n:"Francisco Javier Toledo",pos:["CM","CDM"],r:70},{n:"Fernando Bulnes",pos:["CM"],r:70},
  {n:"Juan Cruz",pos:["CM","LW"],r:69},{n:"Luis Cruz",pos:["LW","CM"],r:69},
  {n:"Celso Güity",pos:["LW","CM"],r:70},{n:"Salomón Nazar",pos:["CM","RW"],r:70},
  {n:"Anthony Costly",pos:["LW","ST"],r:70},{n:"Julio César Arzú",pos:["LW","ST"],r:70},
  {n:"Domingo Drummond",pos:["ST","LW"],r:69},{n:"Héctor Zelaya",pos:["ST"],r:72},
  {n:"Jaime Villegas",pos:["ST","LW"],r:70},{n:"Prudencio Norales",pos:["CM","LW"],r:69}
 ]}],

 "Iraq_1986":[{y:1986,p:[
  {n:"Ahmad Jassim",pos:["GK"],r:71},{n:"Natiq Hashim",pos:["GK"],r:70},{n:"Raad Hammoudi",pos:["GK"],r:69},
  {n:"Ghanim Oraibi",pos:["RB","CB"],r:70},{n:"Ali Hussein Shihab",pos:["CB"],r:71},
  {n:"Basim Qasim",pos:["CB"],r:70},{n:"Rahim Hameed",pos:["CB","LB"],r:70},
  {n:"Anad Abid",pos:["LB","CB"],r:70},{n:"Maad Ibrahim",pos:["LB"],r:70},
  {n:"Karim Allawi",pos:["CDM","CM"],r:70},{n:"Nadhim Shaker",pos:["CM","CDM"],r:71},
  {n:"Haris Mohammed",pos:["CM","CDM"],r:70},{n:"Karim Saddam",pos:["CM"],r:70},
  {n:"Basil Gorgis",pos:["CM","CAM"],r:71},{n:"Khalil Allawi",pos:["LW","CM"],r:70},
  {n:"Ismail Mohammed Sharif",pos:["LW","CM"],r:70},{n:"Jamal Ali",pos:["LW","RW"],r:70},
  {n:"Fatah Nsaief",pos:["LW","ST"],r:70},{n:"Samir Shaker",pos:["ST","LW"],r:70},
  {n:"Shaker Mahmoud",pos:["ST"],r:71},{n:"Ahmed Radhi",pos:["ST","LW"],r:75},
  {n:"Hussein Saeed",pos:["ST"],r:77}
 ]}],

 "Kuwait_1982":[{y:1982,p:[
  {n:"Ahmad Al-Tarabulsi",pos:["GK"],r:71},{n:"Fathi Kameel",pos:["GK"],r:69},{n:"Mubarak Marzouq",pos:["GK"],r:69},
  {n:"Abdulaziz Al-Anberi",pos:["RB","CB"],r:70},{n:"Abdullah Mayouf",pos:["CB"],r:70},
  {n:"Jasem Bahman",pos:["CB"],r:70},{n:"Naeem Saad",pos:["CB","LB"],r:69},
  {n:"Mohammed Karam",pos:["LB","CB"],r:70},{n:"Hamoud Al-Shemmari",pos:["CDM","CM"],r:70},
  {n:"Sami Al-Hashash",pos:["CM","CDM"],r:70},{n:"Adam Marjam",pos:["CM","CDM"],r:69},
  {n:"Abdulaziz Al-Buloushi",pos:["CM"],r:70},{n:"Abdullah Al-Buloushi",pos:["CM","CAM"],r:70},
  {n:"Nassir Al-Ghanim",pos:["CM","LW"],r:70},{n:"Jasem Yaqoub",pos:["LW","CM"],r:70},
  {n:"Jamal Al-Qabendi",pos:["LW","CM"],r:71},{n:"Faisal Al-Dakhil",pos:["LW","ST"],r:70},
  {n:"Mahboub Juma'a",pos:["LW","ST"],r:70},{n:"Muayad Al-Haddad",pos:["ST","LW"],r:70},
  {n:"Waleed Al-Jasem",pos:["ST","LW"],r:71},{n:"Saad Al-Houti",pos:["ST"],r:71},
  {n:"Yussef Al-Suwayed",pos:["ST","LW"],r:70}
 ]}],

 "Mexico_1986":[{y:1986,p:[
  {n:"Pablo Larios",pos:["GK"],r:77},{n:"Raúl Servín",pos:["GK"],r:72},{n:"Armando Manzo",pos:["GK"],r:70},
  {n:"Ignacio Rodríguez",pos:["RB","CB"],r:72},{n:"Fernando Quirarte",pos:["CB"],r:75},
  {n:"Carlos de los Cobos",pos:["CB"],r:73},{n:"Carlos Muñoz",pos:["CB","LB"],r:72},
  {n:"Félix Cruz",pos:["LB","CB"],r:70},{n:"Rafael Amador",pos:["LB"],r:70},
  {n:"Javier Aguirre",pos:["CDM","CM"],r:74},{n:"Mario Trejo",pos:["CM","CDM"],r:71},
  {n:"Tomás Boy",pos:["CM","CDM"],r:71},{n:"Francisco Javier Cruz",pos:["CM","LW"],r:72},
  {n:"Olaf Heredia",pos:["LW","CM"],r:70},{n:"Luis Flores",pos:["LW","CM"],r:70},
  {n:"Alejandro Domínguez",pos:["LW","RW"],r:71},{n:"Miguel España",pos:["LW","ST"],r:73},
  {n:"Manuel Negrete",pos:["CM","CAM"],r:74},{n:"Cristóbal Ortega",pos:["CAM","LW"],r:72},
  {n:"Carlos Hermosillo",pos:["ST","LW"],r:73},{n:"Javier Hernández",pos:["CM","ST"],r:70},
  {n:"Hugo Sánchez",pos:["ST"],r:85}
 ]}],

 "New_Zealand_1982":[{y:1982,p:[
  {n:"Richard Wilson",pos:["GK"],r:72},{n:"Frank van Hattum",pos:["GK"],r:71},{n:"Dave Bright",pos:["GK"],r:70},
  {n:"John Hill",pos:["RB","CB"],r:71},{n:"Sam Malcolmson",pos:["CB"],r:70},
  {n:"Duncan Cole",pos:["CB"],r:70},{n:"Barry Pickering",pos:["CB","LB"],r:70},
  {n:"Glen Adam",pos:["LB","CB"],r:70},{n:"Grant Turner",pos:["LB"],r:70},
  {n:"Steve Wooddin",pos:["CDM","CM"],r:71},{n:"Kenny Cresswell",pos:["CM","CDM"],r:70},
  {n:"Peter Simonsen",pos:["CM","CDM"],r:70},{n:"Brian Turner",pos:["CM"],r:69},
  {n:"Ricki Herbert",pos:["CM","LW"],r:71},{n:"Keith MacKay",pos:["LW","CM"],r:70},
  {n:"Billy McClure",pos:["LW","CM"],r:70},{n:"Adrian Elrick",pos:["LW","RW"],r:70},
  {n:"Glenn Dods",pos:["CAM","LW"],r:71},{n:"Steve Sumner",pos:["ST","LW"],r:73},
  {n:"Allan Boath",pos:["ST"],r:70},{n:"Bobby Almond",pos:["ST","LW"],r:71},
  {n:"Wynton Rufer",pos:["ST","LW"],r:74}
 ]}],

 "Paraguay_1986":[{y:1986,p:[
  {n:"Roberto Fernández",pos:["GK"],r:74},{n:"Rolando Chilavert",pos:["GK"],r:72},{n:"Jorge Guasch",pos:["GK"],r:70},
  {n:"Francisco Alcaraz",pos:["RB","CB"],r:71},{n:"Buenaventura Ferreira",pos:["CB"],r:72},
  {n:"Virginio Cáceres",pos:["CB"],r:72},{n:"Evaristo Isasi",pos:["CB","LB"],r:71},
  {n:"Rogelio Delgado",pos:["LB","CB"],r:70},{n:"Adolfino Cañete",pos:["LB"],r:70},
  {n:"Eufemio Cabral",pos:["CDM","CM"],r:71},{n:"Juan Torales",pos:["CM","CDM"],r:71},
  {n:"Jorge Battaglia",pos:["CM","CDM"],r:72},{n:"Faustino Alonso",pos:["CM"],r:70},
  {n:"Julián Coronel",pos:["CM","LW"],r:70},{n:"Vladimiro Schettina",pos:["LW","CM"],r:70},
  {n:"Alfredo Mendoza",pos:["LW","RW"],r:71},{n:"Luis Caballero",pos:["LW","ST"],r:71},
  {n:"Jorge Amado Nunes",pos:["LW","ST"],r:72},{n:"César Zabala",pos:["ST"],r:70},
  {n:"Roberto Cabañas",pos:["ST","LW"],r:75},{n:"Julio César Romero",pos:["CAM","CM"],r:79},
  {n:"Ramón Hicks",pos:["ST","LW"],r:72}
 ]}],

 "Peru_1982":[{y:1982,p:[
  {n:"Ramón Quiroga",pos:["GK"],r:76},{n:"José González",pos:["GK"],r:70},{n:"Eusebio Acasuzo",pos:["GK"],r:69},
  {n:"Eduardo Malásquez",pos:["RB","CB"],r:73},{n:"Jorge Olaechea",pos:["CB"],r:72},
  {n:"Miguel Gutiérrez",pos:["CB"],r:70},{n:"Oscar Arizaga",pos:["CB","LB"],r:70},
  {n:"Luis Reyna",pos:["LB","CB"],r:72},{n:"Jaime Duarte",pos:["LB"],r:70},
  {n:"José Velásquez",pos:["CDM","CM"],r:73},{n:"Rubén Toribio Díaz",pos:["CM","CDM"],r:71},
  {n:"Carlos Juan Oblitas",pos:["CM","LW"],r:73},{n:"Franco Navarro",pos:["CM","CDM"],r:71},
  {n:"Percy Rojas",pos:["LW","CM"],r:72},{n:"Germán Leguía",pos:["LW","RW"],r:71},
  {n:"Salvador Salguero",pos:["LW","ST"],r:70},{n:"Hugo Gastulo",pos:["CM","LW"],r:70},
  {n:"Gerónimo Barbadillo",pos:["LW","ST"],r:72},{n:"Julio César Uribe",pos:["CAM","CM"],r:76},
  {n:"César Cueto",pos:["CAM","CM"],r:77},{n:"Guillermo La Rosa",pos:["ST"],r:74},
  {n:"Teófilo Cubillas",pos:["CAM","CM"],r:82}
 ]}],

 "Portugal_1986":[{y:1986,p:[
  {n:"Manuel Bento",pos:["GK"],r:76},{n:"Vítor Damas",pos:["GK"],r:73},{n:"Jaime Pacheco",pos:["GK"],r:72},
  {n:"João Pinto",pos:["RB","CB"],r:71},{n:"António Sousa",pos:["CB"],r:72},
  {n:"António Oliveira",pos:["CB"],r:73},{n:"Augusto Inácio",pos:["CB","LB"],r:72},
  {n:"António Morato",pos:["LB","LWB"],r:73},{n:"José Ribeiro",pos:["LB","CB"],r:70},
  {n:"Jaime Magalhães",pos:["CDM","CM"],r:71},{n:"Carlos Manuel",pos:["CM","CDM"],r:73},
  {n:"António André",pos:["CM","CDM"],r:71},{n:"António Sousa",pos:["CM"],r:70},
  {n:"Álvaro",pos:["CM","LW"],r:70},{n:"José António",pos:["LW","CM"],r:70},
  {n:"Luís Sobrinho",pos:["LW","CM"],r:70},{n:"Fernando Bandeirinha",pos:["LW","RW"],r:71},
  {n:"Jorge Martins",pos:["LW","ST"],r:71},{n:"Rui Águas",pos:["ST","LW"],r:73},
  {n:"Diamantino",pos:["LW","ST"],r:72},{n:"Frederico",pos:["CAM","CM"],r:72},
  {n:"Paulo Futre",pos:["LW","CAM"],r:81},{n:"Fernando Gomes",pos:["ST"],r:83}
 ]}],

 "Republic_of_Ireland_1990":[{y:1990,p:[
  {n:"Pat Bonner",pos:["GK"],r:77},{n:"Gerry Peyton",pos:["GK"],r:73},{n:"Alan McLoughlin",pos:["GK"],r:70},
  {n:"Chris Morris",pos:["RB","CB"],r:73},{n:"Paul McGrath",pos:["CB"],r:83},
  {n:"Kevin Moran",pos:["CB"],r:72},{n:"Mick McCarthy",pos:["CB"],r:74},
  {n:"Steve Staunton",pos:["LB","LWB"],r:75},{n:"Chris Hughton",pos:["LB","CB"],r:73},
  {n:"Ray Houghton",pos:["CM","RW"],r:75},{n:"Ronnie Whelan",pos:["CM","CDM"],r:74},
  {n:"Andy Townsend",pos:["CM","CDM"],r:76},{n:"John Sheridan",pos:["CDM","CM"],r:74},
  {n:"Kevin Sheedy",pos:["CM","LW"],r:74},{n:"Frank Stapleton",pos:["ST","LW"],r:74},
  {n:"Bernie Slaven",pos:["ST","LW"],r:71},{n:"John Byrne",pos:["LW","ST"],r:71},
  {n:"David Kelly",pos:["ST","LW"],r:71},{n:"David O'Leary",pos:["CB"],r:77},
  {n:"Niall Quinn",pos:["ST"],r:74},{n:"Tony Cascarino",pos:["ST"],r:73},
  {n:"John Aldridge",pos:["ST"],r:77}
 ]}],

 "United_Arab_Emirates_1990":[{y:1990,p:[
  {n:"Eissa Meer",pos:["GK"],r:70},{n:"Hussain Ghuloum",pos:["GK"],r:69},{n:"Ibrahim Meer",pos:["GK"],r:69},
  {n:"Khalid Ismaïl",pos:["RB","CB"],r:70},{n:"Khalil Ghanim",pos:["CB"],r:70},
  {n:"Hassan Mohamed",pos:["CB"],r:70},{n:"Abdulrahman Mohamed",pos:["CB","LB"],r:70},
  {n:"Mohamed Salim",pos:["LB","CB"],r:70},{n:"Ali Thani Jumaa",pos:["LB"],r:70},
  {n:"Mubarak Ghanim",pos:["CDM","CM"],r:70},{n:"Abdulrahman Al-Haddad",pos:["CM","CDM"],r:70},
  {n:"Abdulaziz Mohamed",pos:["CM"],r:70},{n:"Fahad Abdulrahman",pos:["CM"],r:70},
  {n:"Abdualla Sultan",pos:["CM","LW"],r:70},{n:"Abdulqadir Hassan",pos:["LW","CM"],r:70},
  {n:"Muhsin Musabah",pos:["LW","CM"],r:70},{n:"Abdullah Musa",pos:["LW","RW"],r:70},
  {n:"Fahad Khamees",pos:["LW","ST"],r:70},{n:"Nasir Khamees",pos:["ST","LW"],r:70},
  {n:"Yousuf Hussain",pos:["ST","LW"],r:70},{n:"Zuhair Bakheet",pos:["ST"],r:70},
  {n:"Adnan Al-Talyani",pos:["CAM","LW"],r:74}
 ]}],

 "United_States_1990":[{y:1990,p:[
  {n:"Tony Meola",pos:["GK"],r:76},{n:"David Vanole",pos:["GK"],r:72},{n:"Kasey Keller",pos:["GK"],r:73},
  {n:"John Doyle",pos:["RB","CB"],r:71},{n:"Marcelo Balboa",pos:["CB"],r:73},
  {n:"Mike Windischmann",pos:["CB"],r:72},{n:"Desmond Armstrong",pos:["CB","LB"],r:72},
  {n:"John Stollmeyer",pos:["LB","CB"],r:71},{n:"Christopher Sullivan",pos:["LB"],r:70},
  {n:"Steve Trittschuh",pos:["CDM","CB"],r:71},{n:"Jimmy Banks",pos:["CM","CDM"],r:70},
  {n:"John Harkes",pos:["CM","CDM"],r:74},{n:"Eric Eichmann",pos:["CM","CDM"],r:70},
  {n:"Chris Henderson",pos:["CM","LW"],r:71},{n:"Paul Krumpe",pos:["CM"],r:70},
  {n:"Neil Covone",pos:["CM"],r:69},{n:"Tab Ramos",pos:["CAM","CM"],r:73},
  {n:"Brian Bliss",pos:["LW","CM"],r:71},{n:"Eric Wynalda",pos:["LW","ST"],r:73},
  {n:"Peter Vermes",pos:["ST","LW"],r:71},{n:"Bruce Murray",pos:["ST","LW"],r:72},
  {n:"Paul Caligiuri",pos:["CB","CM"],r:73}
 ]}],

 "Czechoslovakia_1982":[{y:1982,p:[
  {n:"Zdeněk Hruška",pos:["GK"],r:76},{n:"Karel Stromšík",pos:["GK"],r:74},{n:"Rostislav Vojáček",pos:["GK"],r:70},
  {n:"Přemysl Bičovský",pos:["RB","CB"],r:72},{n:"Ladislav Jurkemik",pos:["CB"],r:74},
  {n:"Stanislav Seman",pos:["CB"],r:72},{n:"Tomáš Kříž",pos:["CB","LB"],r:71},
  {n:"Libor Radimec",pos:["LB","CB"],r:70},{n:"Jan Fiala",pos:["RB","CB"],r:71},
  {n:"Pavel Chaloupka",pos:["CDM","CM"],r:71},{n:"Jozef Barmoš",pos:["CM","CDM"],r:71},
  {n:"Jan Berger",pos:["CM","CDM"],r:72},{n:"Ján Kozák",pos:["CM","CDM"],r:71},
  {n:"Vlastimil Petržela",pos:["CM","LW"],r:72},{n:"Petr Janečka",pos:["LW","CM"],r:70},
  {n:"Jozef Kukučka",pos:["LW","CM"],r:70},{n:"Marián Masný",pos:["LW","CAM"],r:74},
  {n:"Ladislav Vízek",pos:["CAM","LW"],r:74},{n:"František Štambachr",pos:["ST","LW"],r:71},
  {n:"František Jakubec",pos:["ST"],r:70},{n:"Antonín Panenka",pos:["CAM","CM"],r:80},
  {n:"Zdeněk Nehoda",pos:["ST","LW"],r:77}
 ]}],

 "Czechoslovakia_1990":[{y:1990,p:[
  {n:"Jan Stejskal",pos:["GK"],r:77},{n:"Luděk Mikloško",pos:["GK"],r:76},{n:"Viliam Hýravý",pos:["GK"],r:71},
  {n:"Ivan Hašek",pos:["RB","CM"],r:74},{n:"Miroslav Kadlec",pos:["CB"],r:77},
  {n:"Ján Kocian",pos:["CB"],r:74},{n:"Jozef Chovanec",pos:["CB","CDM"],r:76},
  {n:"Jiří Němec",pos:["CDM","CM"],r:74},{n:"Peter Fieber",pos:["LB","CB"],r:70},
  {n:"Július Bielik",pos:["CM","CDM"],r:72},{n:"František Straka",pos:["CDM","CM"],r:73},
  {n:"Stanislav Griga",pos:["CM","CDM"],r:71},{n:"Vladimír Kinier",pos:["CM"],r:70},
  {n:"Václav Němeček",pos:["CM","LW"],r:70},{n:"Milan Luhový",pos:["LW","CM"],r:70},
  {n:"Luboš Kubík",pos:["LW","CM"],r:74},{n:"Michal Bílek",pos:["CM","CAM"],r:76},
  {n:"Vladimír Weiss",pos:["LW","CAM"],r:73},{n:"Andrej Panadić",pos:["LW","ST"],r:70},
  {n:"Peter Palúch",pos:["ST","LW"],r:71},{n:"Tomáš Skuhravý",pos:["ST"],r:79},
  {n:"Ľubomír Moravčík",pos:["CAM","LW"],r:78}
 ]}],

 "Hungary_1982":[{y:1982,p:[
  {n:"Ferenc Mészáros",pos:["GK"],r:75},{n:"Béla Katzirz",pos:["GK"],r:72},{n:"Gábor Pölöskei",pos:["GK"],r:70},
  {n:"József Tóth",pos:["RB","CB"],r:72},{n:"Sándor Sallai",pos:["CB"],r:73},
  {n:"László Bálint",pos:["CB"],r:72},{n:"Győző Martos",pos:["CB","LB"],r:71},
  {n:"Imre Kiss",pos:["LB","CB"],r:71},{n:"Imre Garaba",pos:["CDM","CM"],r:74},
  {n:"Béla Bodonyi",pos:["CM","CDM"],r:71},{n:"Károly Csapó",pos:["CM","CDM"],r:71},
  {n:"László Fazekas",pos:["CM","CAM"],r:75},{n:"László Kiss",pos:["CM"],r:70},
  {n:"Lázár Szentes",pos:["CM","LW"],r:70},{n:"Sándor Müller",pos:["LW","CM"],r:70},
  {n:"Ferenc Csongrádi",pos:["LW","RW"],r:71},{n:"Tibor Rab",pos:["LW","ST"],r:72},
  {n:"András Törőcsik",pos:["CAM","LW"],r:76},{n:"József Csuhay",pos:["CM","CDM"],r:73},
  {n:"József Varga",pos:["ST","LW"],r:73},{n:"Attila Kerekes",pos:["ST"],r:72},
  {n:"Tibor Nyilasi",pos:["CAM","ST"],r:79}
 ]}],

 "Hungary_1986":[{y:1986,p:[
  {n:"Péter Disztl",pos:["GK"],r:74},{n:"László Disztl",pos:["GK"],r:72},{n:"Péter Hannich",pos:["GK"],r:70},
  {n:"József Kardos",pos:["RB","CB"],r:71},{n:"Antal Róth",pos:["CB"],r:71},
  {n:"Sándor Sallai",pos:["CB"],r:72},{n:"György Bognár",pos:["CB","LB"],r:71},
  {n:"Kálmán Kovács",pos:["LB","CB"],r:70},{n:"Márton Esterházy",pos:["LB"],r:70},
  {n:"Imre Garaba",pos:["CDM","CM"],r:73},{n:"József Szendrei",pos:["CM","CDM"],r:70},
  {n:"József Csuhay",pos:["CM","CDM"],r:72},{n:"Zoltán Péter",pos:["CM"],r:70},
  {n:"Gyula Hajszán",pos:["CM","LW"],r:70},{n:"Győző Burcsa",pos:["LW","CM"],r:71},
  {n:"László Dajka",pos:["LW","RW"],r:71},{n:"Antal Nagy",pos:["LW","ST"],r:70},
  {n:"József Andrusch",pos:["CM","CAM"],r:71},{n:"József Varga",pos:["ST","LW"],r:72},
  {n:"József Nagy",pos:["ST"],r:70},{n:"József Kiprich",pos:["ST","LW"],r:74},
  {n:"Lajos Détári",pos:["CAM","CM"],r:78}
 ]}],

 "Northern_Ireland_1982":[{y:1982,p:[
  {n:"Pat Jennings",pos:["GK"],r:85},{n:"Jim Platt",pos:["GK"],r:74},{n:"George Dunlop",pos:["GK"],r:70},
  {n:"Jimmy Nicholl",pos:["RB","CB"],r:76},{n:"Chris Nicholl",pos:["CB"],r:76},
  {n:"John McClelland",pos:["CB"],r:75},{n:"Mal Donaghy",pos:["CB","LB"],r:74},
  {n:"Sammy Nelson",pos:["LB","LWB"],r:74},{n:"Tommy Finney",pos:["CM","LW"],r:72},
  {n:"David McCreery",pos:["CDM","CM"],r:74},{n:"Sammy McIlroy",pos:["CM","CAM"],r:77},
  {n:"Tommy Cassidy",pos:["CM","CDM"],r:73},{n:"John O'Neill",pos:["CM"],r:71},
  {n:"Johnny Jameson",pos:["CM","LW"],r:70},{n:"Jim Cleary",pos:["CM","CDM"],r:70},
  {n:"Felix Healy",pos:["CM","LW"],r:70},{n:"Bobby Campbell",pos:["LW","ST"],r:71},
  {n:"Martin O'Neill",pos:["CAM","CM"],r:77},{n:"Noel Brotherston",pos:["LW","RW"],r:72},
  {n:"Norman Whiteside",pos:["ST","CAM"],r:76},{n:"Gerry Armstrong",pos:["ST","LW"],r:76},
  {n:"Billy Hamilton",pos:["ST"],r:74}
 ]}],

 "Northern_Ireland_1986":[{y:1986,p:[
  {n:"Pat Jennings",pos:["GK"],r:82},{n:"Jim Platt",pos:["GK"],r:72},{n:"Philip Hughes",pos:["GK"],r:70},
  {n:"Jimmy Nicholl",pos:["RB","CB"],r:74},{n:"John McClelland",pos:["CB"],r:74},
  {n:"Alan McDonald",pos:["CB"],r:75},{n:"Mal Donaghy",pos:["CB","LB"],r:73},
  {n:"Nigel Worthington",pos:["LB","LWB"],r:73},{n:"David McCreery",pos:["CM","CDM"],r:73},
  {n:"Sammy McIlroy",pos:["CM","CAM"],r:76},{n:"Paul Ramsey",pos:["CM","CDM"],r:71},
  {n:"Bernard McNally",pos:["CM","CDM"],r:71},{n:"John O'Neill",pos:["CM"],r:70},
  {n:"Ian Stewart",pos:["CM","LW"],r:72},{n:"David Campbell",pos:["CM","LW"],r:70},
  {n:"Mark Caughey",pos:["LW","CM"],r:70},{n:"Steve Penney",pos:["LW","RW"],r:71},
  {n:"Gerry Armstrong",pos:["ST","LW"],r:74},{n:"Colin Clarke",pos:["ST","LW"],r:72},
  {n:"Jimmy Quinn",pos:["ST"],r:71},{n:"Billy Hamilton",pos:["ST","LW"],r:73},
  {n:"Norman Whiteside",pos:["ST","CAM"],r:79}
 ]}],

 "Poland_1982":[{y:1982,p:[
  {n:"Józef Młynarczyk",pos:["GK"],r:80},{n:"Roman Wójcicki",pos:["GK"],r:73},{n:"Piotr Mowlik",pos:["GK"],r:70},
  {n:"Stefan Majewski",pos:["RB","CB"],r:74},{n:"Władysław Żmuda",pos:["CB"],r:78},
  {n:"Jacek Kazimierski",pos:["CB"],r:73},{n:"Paweł Janas",pos:["CB","LB"],r:73},
  {n:"Andrzej Pałasz",pos:["LB","CB"],r:72},{n:"Waldemar Matysik",pos:["LB","CDM"],r:72},
  {n:"Marek Kusto",pos:["CDM","CM"],r:72},{n:"Tadeusz Dolny",pos:["CM","CDM"],r:71},
  {n:"Andrzej Buncol",pos:["CM","CDM"],r:74},{n:"Jan Jałocha",pos:["CM","CDM"],r:73},
  {n:"Włodzimierz Ciołek",pos:["CM","LW"],r:71},{n:"Piotr Skrobowski",pos:["LW","CM"],r:70},
  {n:"Janusz Kupcewicz",pos:["LW","CM"],r:73},{n:"Grzegorz Lato",pos:["RW","LW"],r:80},
  {n:"Andrzej Szarmach",pos:["ST","LW"],r:77},{n:"Marek Dziuba",pos:["ST"],r:72},
  {n:"Andrzej Iwan",pos:["LW","ST"],r:73},{n:"Włodzimierz Smolarek",pos:["LW","ST"],r:75},
  {n:"Zbigniew Boniek",pos:["CAM","ST"],r:87}
 ]}],

 "Poland_1986":[{y:1986,p:[
  {n:"Józef Młynarczyk",pos:["GK"],r:79},{n:"Ryszard Komornicki",pos:["GK"],r:72},{n:"Józef Wandzik",pos:["GK"],r:70},
  {n:"Stefan Majewski",pos:["RB","CB"],r:73},{n:"Władysław Żmuda",pos:["CB"],r:76},
  {n:"Marek Ostrowski",pos:["CB"],r:72},{n:"Roman Wójcicki",pos:["CM","CDM"],r:72},
  {n:"Andrzej Pałasz",pos:["LB","CB"],r:71},{n:"Waldemar Matysik",pos:["LB","CDM"],r:71},
  {n:"Andrzej Buncol",pos:["CDM","CM"],r:73},{n:"Jacek Kazimierski",pos:["CM","CDM"],r:72},
  {n:"Ryszard Tarasiewicz",pos:["CM","CDM"],r:72},{n:"Krzysztof Pawlak",pos:["CM"],r:70},
  {n:"Andrzej Zgutczyński",pos:["CM","LW"],r:70},{n:"Dariusz Kubicki",pos:["LB","CM"],r:71},
  {n:"Jan Karaś",pos:["LW","CM"],r:70},{n:"Kazimierz Przybyś",pos:["LW","RW"],r:70},
  {n:"Jan Urban",pos:["LW","ST"],r:74},{n:"Jan Furtok",pos:["ST","LW"],r:73},
  {n:"Włodzimierz Smolarek",pos:["LW","ST"],r:74},{n:"Dariusz Dziekanowski",pos:["LW","ST"],r:76},
  {n:"Zbigniew Boniek",pos:["CAM","ST"],r:86}
 ]}],

 "Romania_1990":[{y:1990,p:[
  {n:"Silviu Lung",pos:["GK"],r:76},{n:"Bogdan Stelea",pos:["GK"],r:75},{n:"Zsolt Muzsnay",pos:["GK"],r:70},
  {n:"Mircea Rednic",pos:["RB","CB"],r:73},{n:"Gheorghe Popescu",pos:["CB","CDM"],r:79},
  {n:"Miodrag Belodedici",pos:["CB"],r:76},{n:"Michael Klein",pos:["CB","LB"],r:70},
  {n:"Iosif Rotariu",pos:["LB","CB"],r:72},{n:"Dan Petrescu",pos:["RB","RWB"],r:79},
  {n:"Ioan Lupescu",pos:["CDM","CM"],r:75},{n:"Ioan Andone",pos:["CM","CDM"],r:72},
  {n:"Emil Săndoi",pos:["CM","CDM"],r:71},{n:"Ioan Sabău",pos:["CM","CAM"],r:73},
  {n:"Adrian Popescu",pos:["CM"],r:70},{n:"Gheorghe Liliac",pos:["CM","LW"],r:70},
  {n:"Dorin Mateuț",pos:["LW","CM"],r:73},{n:"Dănuț Lupu",pos:["CAM","LW"],r:73},
  {n:"Rodion Cămătaru",pos:["LW","ST"],r:72},{n:"Gabi Balint",pos:["LW","ST"],r:74},
  {n:"Daniel Timofte",pos:["CM","CDM"],r:71},{n:"Marius Lăcătuș",pos:["LW","ST"],r:76},
  {n:"Florin Răducioiu",pos:["ST","LW"],r:76},{n:"Ilie Dumitrescu",pos:["CAM","LW"],r:79},
  {n:"Gheorghe Hagi",pos:["CAM","CM"],r:88}
 ]}],

 "Soviet_Union_1982":[{y:1982,p:[
  {n:"Rinat Dasayev",pos:["GK"],r:85},{n:"Viktor Chanov",pos:["GK"],r:77},{n:"Vyacheslav Chanov",pos:["GK"],r:73},
  {n:"Sergei Baltacha",pos:["RB","CB"],r:73},{n:"Aleksandr Chivadze",pos:["CB"],r:78},
  {n:"Oleg Romantsev",pos:["CB"],r:74},{n:"Tengiz Sulakvelidze",pos:["CB","LB"],r:73},
  {n:"Anatoliy Demyanenko",pos:["LB","LWB"],r:79},{n:"Volodymyr Bezsonov",pos:["LB","CDM"],r:74},
  {n:"Vagiz Khidiyatullin",pos:["CDM","CM"],r:74},{n:"Andriy Bal",pos:["CM","CDM"],r:74},
  {n:"Leonid Buryak",pos:["CM","CAM"],r:76},{n:"Sergei Borovsky",pos:["CM","CDM"],r:72},
  {n:"Khoren Hovhannisyan",pos:["CM","LW"],r:73},{n:"Yuri Gavrilov",pos:["CM","CAM"],r:75},
  {n:"Vadym Yevtushenko",pos:["LW","CM"],r:73},{n:"Sergey Andreyev",pos:["LW","ST"],r:74},
  {n:"Sergey Rodionov",pos:["LW","ST"],r:74},{n:"Ramaz Shengelia",pos:["LW","ST"],r:75},
  {n:"Vitaly Daraselia",pos:["LW","ST"],r:73},{n:"Yuri Susloparov",pos:["CM","CDM"],r:72},
  {n:"Oleh Blokhin",pos:["LW","ST"],r:86}
 ]}],

 "Soviet_Union_1986":[{y:1986,p:[
  {n:"Rinat Dasayev",pos:["GK"],r:86},{n:"Viktor Chanov",pos:["GK"],r:76},{n:"Gennady Morozov",pos:["GK"],r:70},
  {n:"Volodymyr Bezsonov",pos:["RB","CDM"],r:74},{n:"Aleksandr Chivadze",pos:["CB"],r:76},
  {n:"Aleksandr Bubnov",pos:["CB"],r:73},{n:"Oleh Kuznetsov",pos:["CB"],r:79},
  {n:"Anatoliy Demyanenko",pos:["LB","LWB"],r:79},{n:"Andriy Bal",pos:["CDM","CM"],r:73},
  {n:"Sergei Aleinikov",pos:["CDM","CM"],r:76},{n:"Pavel Yakovenko",pos:["CM","CDM"],r:74},
  {n:"Ivan Yaremchuk",pos:["CM","CDM"],r:74},{n:"Gennadiy Litovchenko",pos:["CM","CAM"],r:77},
  {n:"Vasyl Rats",pos:["LW","CM"],r:74},{n:"Serhiy Krakovskiy",pos:["LW","CM"],r:71},
  {n:"Vadym Yevtushenko",pos:["LW","CM"],r:72},{n:"Nikolay Larionov",pos:["LW","ST"],r:71},
  {n:"Sergey Rodionov",pos:["LW","ST"],r:74},{n:"Oleh Protasov",pos:["ST"],r:79},
  {n:"Oleksandr Zavarov",pos:["CAM","CM"],r:80},{n:"Ihor Belanov",pos:["LW","ST"],r:82},
  {n:"Oleh Blokhin",pos:["LW","ST"],r:82}
 ]}],

 "Soviet_Union_1990":[{y:1990,p:[
  {n:"Rinat Dasayev",pos:["GK"],r:83},{n:"Viktor Chanov",pos:["GK"],r:73},{n:"Aleksandr Uvarov",pos:["GK"],r:72},
  {n:"Volodymyr Bezsonov",pos:["RB","CDM"],r:73},{n:"Oleh Kuznetsov",pos:["CB"],r:79},
  {n:"Vagiz Khidiyatullin",pos:["CB"],r:72},{n:"Anatoliy Demyanenko",pos:["LB","LWB"],r:77},
  {n:"Sergei Gorlukovich",pos:["CB","LB"],r:74},{n:"Sergei Fokin",pos:["CB"],r:72},
  {n:"Sergei Aleinikov",pos:["CDM","CM"],r:75},{n:"Akhrik Tsveiba",pos:["CM","CDM"],r:71},
  {n:"Ivan Yaremchuk",pos:["CM","CDM"],r:73},{n:"Andrei Zygmantovich",pos:["CM","CDM"],r:71},
  {n:"Gennadiy Litovchenko",pos:["CM","CAM"],r:76},{n:"Vasyl Rats",pos:["LW","CM"],r:73},
  {n:"Valeri Broshin",pos:["LW","ST"],r:72},{n:"Igor Shalimov",pos:["CM","CAM"],r:74},
  {n:"Igor Dobrovolski",pos:["CAM","CM"],r:76},{n:"Oleksandr Zavarov",pos:["CAM","CM"],r:78},
  {n:"Oleh Protasov",pos:["ST"],r:78},{n:"Aleksandr Borodyuk",pos:["CM","ST"],r:72},
  {n:"Volodymyr Lyutyi",pos:["LW","ST"],r:72}
 ]}],

 "Yugoslavia_1982":[{y:1982,p:[
  {n:"Dragan Pantelić",pos:["GK"],r:76},{n:"Ratko Svilar",pos:["GK"],r:73},{n:"Ivan Pudar",pos:["GK"],r:70},
  {n:"Ivan Gudelj",pos:["RB","CB"],r:73},{n:"Nikola Jovanović",pos:["CB"],r:74},
  {n:"Miloš Šestić",pos:["CB"],r:72},{n:"Zvonko Živković",pos:["CB","LB"],r:73},
  {n:"Edhem Šljivo",pos:["LB","CB"],r:70},{n:"Ive Jerolimov",pos:["LB"],r:70},
  {n:"Vladimir Petrović",pos:["CDM","CM"],r:75},{n:"Predrag Pašić",pos:["CM","CDM"],r:73},
  {n:"Velimir Zajec",pos:["CM","CDM"],r:77},{n:"Miloš Hrstić",pos:["CM"],r:71},
  {n:"Nenad Stojković",pos:["CM","LW"],r:71},{n:"Stjepan Deverić",pos:["CM","CDM"],r:71},
  {n:"Zlatko Krmpotić",pos:["LW","CM"],r:71},{n:"Jurica Jerković",pos:["LW","CAM"],r:74},
  {n:"Ivica Šurjak",pos:["LW","ST"],r:75},{n:"Safet Sušić",pos:["CAM","LW"],r:82},
  {n:"Vahid Halilhodžić",pos:["ST","LW"],r:81},{n:"Zlatko Vujović",pos:["LW","ST"],r:76},
  {n:"Zoran Vujović",pos:["ST","LW"],r:75}
 ]}],

 "Yugoslavia_1990":[{y:1990,p:[
  {n:"Tomislav Ivković",pos:["GK"],r:80},{n:"Dragoje Leković",pos:["GK"],r:73},{n:"Fahrudin Omerović",pos:["GK"],r:70},
  {n:"Refik Šabanadžović",pos:["RB","CB"],r:72},{n:"Faruk Hadžibegić",pos:["CB","CDM"],r:76},
  {n:"Vujadin Stanojković",pos:["CB"],r:72},{n:"Predrag Spasić",pos:["CB","LB"],r:71},
  {n:"Andrej Panadić",pos:["LB","CB"],r:71},{n:"Mirsad Baljić",pos:["LB"],r:70},
  {n:"Srečko Katanec",pos:["CDM","CM"],r:75},{n:"Davor Jozić",pos:["CM","CDM"],r:73},
  {n:"Zoran Vulić",pos:["CM","CDM"],r:72},{n:"Safet Sušić",pos:["CAM","LW"],r:80},
  {n:"Dragoljub Brnović",pos:["CM","CDM"],r:71},{n:"Robert Prosinečki",pos:["CAM","CM"],r:80},
  {n:"Robert Jarni",pos:["LB","LWB"],r:76},{n:"Zlatko Vujović",pos:["LW","ST"],r:74},
  {n:"Alen Bokšić",pos:["ST","LW"],r:76},{n:"Davor Šuker",pos:["ST"],r:79},
  {n:"Dragan Stojković",pos:["CAM","CM"],r:84},{n:"Dejan Savićević",pos:["CAM","LW"],r:85},
  {n:"Darko Pančev",pos:["ST"],r:82}
 ]}],

 "Algeria_1982":[{y:1982,p:[
  {n:"Mehdi Cerbah",pos:["GK"],r:71},{n:"Djamel Zidane",pos:["GK"],r:70},{n:"Mourad Amara",pos:["GK"],r:69},
  {n:"Hocine Yahi",pos:["CB","RB"],r:71},{n:"Mahmoud Guendouz",pos:["CB"],r:72},
  {n:"Chaabane Merzekane",pos:["CB"],r:73},{n:"Salah Larbes",pos:["LB","CB"],r:70},
  {n:"Mustafa Kouici",pos:["LB"],r:70},{n:"Abdelkader Horr",pos:["RB","CB"],r:70},
  {n:"Abdelmajid Bourebbou",pos:["CDM","CM"],r:70},{n:"Nourredine Kourichi",pos:["CM","CDM"],r:71},
  {n:"Ali Bencheikh",pos:["CM","CDM"],r:70},{n:"Yacine Bentalaa",pos:["CM"],r:70},
  {n:"Ali Fergani",pos:["CM","CAM"],r:73},{n:"Faouzi Mansouri",pos:["CM","LW"],r:71},
  {n:"Djamel Tlemçani",pos:["CM","LW"],r:70},{n:"Mustapha Dahleb",pos:["CAM","LW"],r:74},
  {n:"Karim Maroc",pos:["LW","ST"],r:71},{n:"Salah Assad",pos:["LW","ST"],r:72},
  {n:"Tedj Bensaoula",pos:["ST","LW"],r:72},{n:"Lakhdar Belloumi",pos:["CAM","LW"],r:80},
  {n:"Rabah Madjer",pos:["LW","ST"],r:79}
 ]}],

 "Algeria_1986":[{y:1986,p:[
  {n:"Nacerdine Drid",pos:["GK"],r:72},{n:"Djamel Menad",pos:["GK"],r:71},{n:"Halim Benmabrouk",pos:["GK"],r:70},
  {n:"Larbi El Hadi",pos:["CB","RB"],r:72},{n:"Mahmoud Guendouz",pos:["CB"],r:72},
  {n:"Fathi Chebal",pos:["CB"],r:71},{n:"Mohamed Kaci-Saïd",pos:["CB","LB"],r:70},
  {n:"Mourad Amara",pos:["LB","CB"],r:70},{n:"Abdellah Medjadi Liegeon",pos:["LB"],r:70},
  {n:"Abdelhamid Sadmi",pos:["CDM","CM"],r:70},{n:"Nourredine Kourichi",pos:["CM","CDM"],r:71},
  {n:"Faouzi Mansouri",pos:["CM","CDM"],r:71},{n:"Fodil Megharia",pos:["CM"],r:71},
  {n:"Mohammed Chaib",pos:["CM","LW"],r:70},{n:"Djamel Zidane",pos:["LW","CM"],r:70},
  {n:"Fawzi Benkhalidi",pos:["LW","RW"],r:70},{n:"Karim Maroc",pos:["LW","ST"],r:71},
  {n:"Salah Assad",pos:["LW","ST"],r:72},{n:"Rachid Harkouk",pos:["LW","CAM"],r:73},
  {n:"Tedj Bensaoula",pos:["ST","LW"],r:72},{n:"Lakhdar Belloumi",pos:["CAM","LW"],r:79},
  {n:"Rabah Madjer",pos:["LW","ST"],r:80}
 ]}],

 "Austria_1990":[{y:1990,p:[
  {n:"Klaus Lindenberger",pos:["GK"],r:74},{n:"Michael Konsel",pos:["GK"],r:73},{n:"Otto Konrad",pos:["GK"],r:71},
  {n:"Peter Schöttel",pos:["RB","CB"],r:74},{n:"Anton Pfeffer",pos:["CB"],r:72},
  {n:"Kurt Russ",pos:["CB"],r:72},{n:"Andreas Reisinger",pos:["CB","LB"],r:71},
  {n:"Christian Keglevits",pos:["LB","CB"],r:70},{n:"Manfred Zsak",pos:["CDM","CM"],r:71},
  {n:"Alfred Hörtnagl",pos:["CDM","CM"],r:71},{n:"Ernst Aigner",pos:["CM","CDM"],r:71},
  {n:"Heimo Pfeifenberger",pos:["CM","LW"],r:71},{n:"Peter Artner",pos:["CM"],r:70},
  {n:"Michael Streiter",pos:["CM"],r:70},{n:"Manfred Linzmaier",pos:["LW","CM"],r:70},
  {n:"Gerald Glatzmayer",pos:["LW","CM"],r:70},{n:"Robert Pecl",pos:["LW","RW"],r:70},
  {n:"Andreas Ogris",pos:["LW","ST"],r:73},{n:"Gerhard Rodax",pos:["ST","LW"],r:72},
  {n:"Michael Baur",pos:["ST"],r:71},{n:"Andi Herzog",pos:["CM","LW"],r:74},
  {n:"Toni Polster",pos:["ST"],r:78}
 ]}],

 "Scotland_1982":[{y:1982,p:[
  {n:"Alan Rough",pos:["GK"],r:77},{n:"Jim Leighton",pos:["GK"],r:77},{n:"George Wood",pos:["GK"],r:73},
  {n:"Danny McGrain",pos:["RB","CB"],r:78},{n:"Willie Miller",pos:["CB"],r:80},
  {n:"Alex McLeish",pos:["CB"],r:79},{n:"Allan Evans",pos:["CB","LB"],r:74},
  {n:"Frank Gray",pos:["LB","LWB"],r:75},{n:"George Burley",pos:["RB","CB"],r:74},
  {n:"Asa Hartford",pos:["CDM","CM"],r:74},{n:"Graeme Souness",pos:["CM","CDM"],r:85},
  {n:"John Wark",pos:["CM","CDM"],r:78},{n:"Gordon Strachan",pos:["CM","RW"],r:80},
  {n:"David Narey",pos:["CB","CDM"],r:74},{n:"Davie Provan",pos:["RW","LW"],r:73},
  {n:"John Robertson",pos:["LW","LM"],r:77},{n:"Steve Archibald",pos:["ST","LW"],r:77},
  {n:"Paul Sturrock",pos:["LW","ST"],r:73},{n:"Alan Brazil",pos:["ST","LW"],r:74},
  {n:"Joe Jordan",pos:["ST"],r:76},{n:"Kenny Dalglish",pos:["ST","CAM"],r:88}
 ]}],

 "Scotland_1986":[{y:1986,p:[
  {n:"Jim Leighton",pos:["GK"],r:80},{n:"Alan Rough",pos:["GK"],r:75},{n:"Andy Goram",pos:["GK"],r:77},
  {n:"Richard Gough",pos:["RB","CB"],r:80},{n:"Willie Miller",pos:["CB"],r:79},
  {n:"Alex McLeish",pos:["CB"],r:79},{n:"Maurice Malpas",pos:["LB","LWB"],r:74},
  {n:"Arthur Albiston",pos:["LB","CB"],r:73},{n:"David Narey",pos:["CB","CDM"],r:74},
  {n:"Roy Aitken",pos:["CDM","CM"],r:75},{n:"Graeme Souness",pos:["CM","CDM"],r:84},
  {n:"Jim Bett",pos:["CM","CDM"],r:73},{n:"Gordon Strachan",pos:["CM","RW"],r:80},
  {n:"Eamonn Bannon",pos:["CM","LW"],r:72},{n:"Paul McStay",pos:["CM","CAM"],r:78},
  {n:"Davie Cooper",pos:["LW","RW"],r:79},{n:"Charlie Nicholas",pos:["ST","CAM"],r:75},
  {n:"Paul Sturrock",pos:["LW","ST"],r:72},{n:"Graeme Sharp",pos:["ST"],r:75},
  {n:"Frank McAvennie",pos:["ST","LW"],r:73},{n:"Steve Nicol",pos:["RB","CM"],r:76},
  {n:"Steve Archibald",pos:["ST","LW"],r:76}
 ]}],

 "Scotland_1990":[{y:1990,p:[
  {n:"Jim Leighton",pos:["GK"],r:78},{n:"Andy Goram",pos:["GK"],r:79},{n:"Bryan Gunn",pos:["GK"],r:76},
  {n:"Richard Gough",pos:["CB","RB"],r:80},{n:"Alex McLeish",pos:["CB"],r:78},
  {n:"David McPherson",pos:["CB"],r:73},{n:"Craig Levein",pos:["CB"],r:73},
  {n:"Maurice Malpas",pos:["LB","LWB"],r:74},{n:"Stewart McKimmie",pos:["RB","CB"],r:73},
  {n:"Roy Aitken",pos:["CDM","CM"],r:74},{n:"Paul McStay",pos:["CM","CAM"],r:79},
  {n:"Stuart McCall",pos:["CM","CDM"],r:74},{n:"Gary McAllister",pos:["CM","CAM"],r:76},
  {n:"Jim Bett",pos:["CM","CDM"],r:72},{n:"Murdo MacLeod",pos:["CM","CDM"],r:72},
  {n:"John Collins",pos:["CM","CAM"],r:75},{n:"Gary Gillespie",pos:["CB"],r:74},
  {n:"Gordon Durie",pos:["LW","ST"],r:73},{n:"Mo Johnston",pos:["ST","LW"],r:77},
  {n:"Robert Fleck",pos:["ST"],r:72},{n:"Alan McInally",pos:["ST","LW"],r:73},
  {n:"Ally McCoist",pos:["ST"],r:78}
 ]}],

 "Australia_1974":[{y:1974,p:[
  {n:"Jack Reilly",pos:["GK"],r:72},{n:"Manfred Schaefer",pos:["GK"],r:71},{n:"Jim Milisavljevic",pos:["GK"],r:70},
  {n:"Ray Richards",pos:["RB","CB"],r:71},{n:"Colin Curran",pos:["CB"],r:71},
  {n:"Peter Ollerton",pos:["CB"],r:70},{n:"Peter Wilson",pos:["CB","LB"],r:70},
  {n:"Allan Maher",pos:["LB","CB"],r:70},{n:"Garry Manuel",pos:["LB"],r:70},
  {n:"Johnny Warren",pos:["CDM","CM"],r:74},{n:"Branko Buljevic",pos:["CM","CDM"],r:71},
  {n:"Doug Utjesenovic",pos:["CM","CDM"],r:70},{n:"Ivo Rudic",pos:["CM"],r:70},
  {n:"Dave Harding",pos:["CM","LW"],r:70},{n:"Max Tolson",pos:["LW","CM"],r:70},
  {n:"Harry Williams",pos:["LW","CM"],r:70},{n:"Jimmy Mackay",pos:["LW","RW"],r:70},
  {n:"Jimmy Rooney",pos:["LW","ST"],r:70},{n:"Ernie Campbell",pos:["ST"],r:70},
  {n:"Attila Abonyi",pos:["ST","LW"],r:72},{n:"Adrian Alston",pos:["LW","ST"],r:72},
  {n:"Johnny Watkiss",pos:["CM","LW"],r:70}
 ]}],

 "Austria_1978":[{y:1978,p:[
  {n:"Friedrich Koncilia",pos:["GK"],r:78},{n:"Robert Sara",pos:["GK"],r:71},{n:"Gerhard Breitenberger",pos:["GK"],r:70},
  {n:"Ernst Baumeister",pos:["RB","CB"],r:72},{n:"Bruno Pezzey",pos:["CB"],r:79},
  {n:"Erich Obermayer",pos:["CB"],r:74},{n:"Peter Persidis",pos:["CB","LB"],r:71},
  {n:"Roland Hattenberger",pos:["LB","CB"],r:71},{n:"Heinrich Strasser",pos:["LB"],r:70},
  {n:"Herbert Prohaska",pos:["CM","CAM"],r:80},{n:"Josef Hickersberger",pos:["CDM","CM"],r:73},
  {n:"Heribert Weber",pos:["CM","CDM"],r:72},{n:"Günther Happich",pos:["CM"],r:70},
  {n:"Franz Oberacher",pos:["CM","LW"],r:70},{n:"Eduard Krieger",pos:["LW","CM"],r:70},
  {n:"Hans Pirkner",pos:["LW","CM"],r:70},{n:"Erwin Fuchsbichler",pos:["LW","RW"],r:71},
  {n:"Kurt Jara",pos:["LW","ST"],r:72},{n:"Wilhelm Kreuz",pos:["ST"],r:70},
  {n:"Hubert Baumgartner",pos:["ST","LW"],r:70},{n:"Walter Schachner",pos:["ST","LW"],r:74},
  {n:"Hans Krankl",pos:["ST"],r:83}
 ]}],

 "Bulgaria_1970":[{y:1970,p:[
  {n:"Simeon Simeonov",pos:["GK"],r:74},{n:"Ivan Dimitrov",pos:["GK"],r:70},{n:"Milko Gaydarski",pos:["GK"],r:70},
  {n:"Ivan Davidov",pos:["RB","CB"],r:71},{n:"Boris Gaganelov",pos:["CB"],r:72},
  {n:"Dimitar Penev",pos:["CB","CDM"],r:76},{n:"Dobromir Zhechev",pos:["CB"],r:70},
  {n:"Vasil Mitkov",pos:["LB","CB"],r:70},{n:"Stefan Aladzhov",pos:["LB"],r:70},
  {n:"Todor Kolev",pos:["CDM","CM"],r:70},{n:"Dinko Dermendzhiev",pos:["CM","CDM"],r:71},
  {n:"Stoyan Yordanov",pos:["CM","CDM"],r:71},{n:"Aleksandar Shalamanov",pos:["CM"],r:70},
  {n:"Asparuh Nikodimov",pos:["CM","LW"],r:71},{n:"Dimitar Marashliev",pos:["LW","CM"],r:70},
  {n:"Hristo Bonev",pos:["CAM","CM"],r:77},{n:"Dimitar Yakimov",pos:["LW","RW"],r:72},
  {n:"Georgi Kamenski",pos:["LW","ST"],r:70},{n:"Georgi Popov",pos:["LW","ST"],r:71},
  {n:"Petar Zhekov",pos:["ST"],r:76},{n:"Bozhidar Grigorov",pos:["LW","ST"],r:70},
  {n:"Georgi Asparuhov",pos:["LW","ST"],r:78}
 ]}],

 "Bulgaria_1974":[{y:1974,p:[
  {n:"Simeon Simeonov",pos:["GK"],r:73},{n:"Atanas Mihailov",pos:["GK"],r:72},{n:"Bozhidar Grigorov",pos:["GK"],r:70},
  {n:"Stefan Staykov",pos:["RB","CB"],r:71},{n:"Dobromir Zhechev",pos:["CB"],r:70},
  {n:"Dimitar Penev",pos:["CB","CDM"],r:76},{n:"Ivan Stoyanov",pos:["CB"],r:70},
  {n:"Kiril Milanov",pos:["LB","CB"],r:70},{n:"Stefan Aladzhov",pos:["LB"],r:70},
  {n:"Kiril Ivkov",pos:["CDM","CM"],r:71},{n:"Rumyancho Goranov",pos:["CM","CDM"],r:70},
  {n:"Mladen Vasilev",pos:["CM","CDM"],r:70},{n:"Bozhil Kolev",pos:["CM"],r:70},
  {n:"Georgi Denev",pos:["CM","LW"],r:70},{n:"Ivan Zafirov",pos:["LW","CM"],r:70},
  {n:"Hristo Bonev",pos:["CAM","CM"],r:77},{n:"Pavel Panov",pos:["LW","RW"],r:71},
  {n:"Asparuh Nikodimov",pos:["LW","ST"],r:71},{n:"Stefko Velichkov",pos:["LW","ST"],r:70},
  {n:"Tsonyo Vasilev",pos:["ST"],r:70},{n:"Voyn Voynov",pos:["ST","LW"],r:70},
  {n:"Krasimir Borisov",pos:["CM","LW"],r:71}
 ]}],

 "Chile_1974":[{y:1974,p:[
  {n:"Leopoldo Vallejos",pos:["GK"],r:73},{n:"Sergio Ahumada",pos:["GK"],r:70},{n:"Alberto Quintano",pos:["GK"],r:70},
  {n:"Rafael González",pos:["RB","CB"],r:71},{n:"Elías Figueroa",pos:["CB"],r:82},
  {n:"Adolfo Nef",pos:["CB"],r:73},{n:"Antonio Arias",pos:["CB","LB"],r:71},
  {n:"Juan Rodríguez",pos:["LB","CB"],r:70},{n:"Guillermo Yávar",pos:["LB"],r:70},
  {n:"Carlos Reinoso",pos:["CDM","CM"],r:76},{n:"Rogelio Farías",pos:["CM","CDM"],r:70},
  {n:"Juan Olivares",pos:["CM","CDM"],r:71},{n:"Guillermo Páez",pos:["CM"],r:70},
  {n:"Jorge Socías",pos:["CM","LW"],r:70},{n:"Mario Galindo",pos:["LW","CM"],r:70},
  {n:"Juan Machuca",pos:["LW","CM"],r:70},{n:"Alfonso Lara",pos:["LW","RW"],r:70},
  {n:"Osvaldo Castro",pos:["LW","ST"],r:71},{n:"Leonardo Véliz",pos:["ST","LW"],r:73},
  {n:"Francisco Valdés",pos:["LW","ST"],r:74},{n:"Rolando García",pos:["ST"],r:71},
  {n:"Carlos Caszely",pos:["ST"],r:79}
 ]}],

 "Czechoslovakia_1970":[{y:1970,p:[
  {n:"Ivo Viktor",pos:["GK"],r:79},{n:"Alexander Vencel",pos:["GK"],r:74},{n:"František Veselý",pos:["GK"],r:70},
  {n:"Ján Zlocha",pos:["RB","CB"],r:70},{n:"Ladislav Kuna",pos:["CB"],r:71},
  {n:"Ján Pivarník",pos:["CB"],r:71},{n:"Ivan Hrdlička",pos:["CB","LB"],r:70},
  {n:"Josef Jurkanin",pos:["LB","CB"],r:70},{n:"Vladimír Hagara",pos:["LB"],r:70},
  {n:"Karol Dobiaš",pos:["CDM","CM"],r:73},{n:"Jaroslav Pollák",pos:["CM","CDM"],r:70},
  {n:"Bohumil Veselý",pos:["CM","CDM"],r:70},{n:"Alexander Horváth",pos:["CM"],r:71},
  {n:"Vladimír Hrivnák",pos:["CM","LW"],r:70},{n:"Václav Migas",pos:["LW","CM"],r:70},
  {n:"Anton Flešár",pos:["LW","RW"],r:70},{n:"Andrej Kvašňák",pos:["CAM","CM"],r:75},
  {n:"Ladislav Petráš",pos:["LW","ST"],r:71},{n:"Milan Albrecht",pos:["ST","LW"],r:70},
  {n:"Jozef Adamec",pos:["ST","LW"],r:74},{n:"Karol Jokl",pos:["CM","LW"],r:70},
  {n:"Ján Čapkovič",pos:["LW","ST"],r:72}
 ]}],

 "East_Germany_1974":[{y:1974,p:[
  {n:"Jürgen Croy",pos:["GK"],r:80},{n:"Wolfgang Blochwitz",pos:["GK"],r:72},{n:"Wolfram Löwe",pos:["GK"],r:70},
  {n:"Bernd Bransch",pos:["CB","CDM"],r:77},{n:"Konrad Weise",pos:["CB"],r:74},
  {n:"Eberhard Vogel",pos:["CB"],r:73},{n:"Lothar Kurbjuweit",pos:["RB","CB"],r:72},
  {n:"Werner Friese",pos:["LB","CB"],r:71},{n:"Reinhard Lauck",pos:["LB"],r:70},
  {n:"Harald Irmscher",pos:["CDM","CM"],r:73},{n:"Jürgen Pommerenke",pos:["CM","CDM"],r:72},
  {n:"Siegmar Wätzlich",pos:["CM","CDM"],r:71},{n:"Martin Hoffmann",pos:["CM"],r:70},
  {n:"Wolfgang Seguin",pos:["CM","LW"],r:71},{n:"Rüdiger Schnuphase",pos:["LW","CM"],r:71},
  {n:"Erich Hamann",pos:["LW","CM"],r:72},{n:"Peter Ducke",pos:["LW","RW"],r:73},
  {n:"Joachim Fritsche",pos:["LW","ST"],r:70},{n:"Hans-Jürgen Kreische",pos:["ST","LW"],r:75},
  {n:"Gerd Kische",pos:["ST"],r:72},{n:"Jürgen Sparwasser",pos:["LW","ST"],r:76},
  {n:"Joachim Streich",pos:["ST"],r:79}
 ]}],

 "El_Salvador_1970":[{y:1970,p:[
  {n:"Raúl Magaña",pos:["GK"],r:70},{n:"Mario Monge",pos:["GK"],r:69},{n:"Salvador Cabezas",pos:["GK"],r:69},
  {n:"Roberto Rivas",pos:["RB","CB"],r:70},{n:"Mauricio Rodríguez",pos:["CB"],r:70},
  {n:"Ernesto Aparicio",pos:["CB"],r:70},{n:"Salvador Mariona",pos:["CB","LB"],r:70},
  {n:"Jorge Vásquez",pos:["LB","CB"],r:69},{n:"Santiago Cortés",pos:["LB"],r:69},
  {n:"Elmer Acevedo",pos:["CDM","CM"],r:70},{n:"Juan Ramón Martínez",pos:["CM","CDM"],r:70},
  {n:"Mauricio Manzano",pos:["CM","CDM"],r:70},{n:"Jaime Portillo",pos:["CM"],r:69},
  {n:"David Cabrera",pos:["CM","LW"],r:70},{n:"Saturnino Osorio",pos:["LW","CM"],r:69},
  {n:"Tomás Pineda",pos:["LW","RW"],r:70},{n:"Genaro Sarmeno",pos:["LW","ST"],r:70},
  {n:"Guillermo Castro",pos:["LW","ST"],r:70},{n:"Gualberto Fernández",pos:["ST"],r:70},
  {n:"José Quintanilla",pos:["ST","LW"],r:70},{n:"Alberto Villalta",pos:["ST"],r:70},
  {n:"Sergio Méndez",pos:["CM","LW"],r:70}
 ]}],

 "England_1970":[{y:1970,p:[
  {n:"Gordon Banks",pos:["GK"],r:92},{n:"Peter Bonetti",pos:["GK"],r:80},{n:"Alex Stepney",pos:["GK"],r:76},
  {n:"Tommy Wright",pos:["RB","CB"],r:74},{n:"Brian Labone",pos:["CB"],r:77},
  {n:"Bobby Moore",pos:["CB","CDM"],r:91},{n:"Jack Charlton",pos:["CB"],r:80},
  {n:"Terry Cooper",pos:["LB","LWB"],r:77},{n:"Keith Newton",pos:["RB","LB"],r:74},
  {n:"Nobby Stiles",pos:["CDM","CM"],r:77},{n:"Alan Mullery",pos:["CDM","CM"],r:75},
  {n:"Norman Hunter",pos:["CDM","CB"],r:79},{n:"Colin Bell",pos:["CM","CDM"],r:79},
  {n:"Martin Peters",pos:["CM","CAM"],r:81},{n:"Alan Ball",pos:["CM","CDM"],r:81},
  {n:"Bobby Charlton",pos:["CM","CAM"],r:88},{n:"Peter Osgood",pos:["CAM","ST"],r:77},
  {n:"Emlyn Hughes",pos:["LB","CM"],r:76},{n:"Jeff Astle",pos:["ST"],r:74},
  {n:"Francis Lee",pos:["ST","LW"],r:78},{n:"Allan Clarke",pos:["ST"],r:77},
  {n:"Geoff Hurst",pos:["ST"],r:82}
 ]}],

 "France_1978":[{y:1978,p:[
  {n:"Jean-Paul Bertrand-Demanes",pos:["GK"],r:73},{n:"Dominique Dropsy",pos:["GK"],r:73},{n:"Dominique Baratelli",pos:["GK"],r:72},
  {n:"Gérard Janvion",pos:["RB","CB"],r:73},{n:"Marius Trésor",pos:["CB"],r:79},
  {n:"Christian Lopez",pos:["CB"],r:72},{n:"Patrice Rio",pos:["CB","LB"],r:72},
  {n:"Maxime Bossis",pos:["CB","LB"],r:78},{n:"Patrick Battiston",pos:["RB","CB"],r:73},
  {n:"Henri Michel",pos:["CDM","CM"],r:74},{n:"Jean-Marc Guillou",pos:["CM","CDM"],r:72},
  {n:"Dominique Bathenay",pos:["CM","CDM"],r:74},{n:"Jean Petit",pos:["CM","CDM"],r:71},
  {n:"Claude Papi",pos:["CM","LW"],r:70},{n:"François Bracci",pos:["LW","CM"],r:70},
  {n:"Olivier Rouyer",pos:["LW","CM"],r:71},{n:"Dominique Rocheteau",pos:["LW","ST"],r:78},
  {n:"Christian Dalger",pos:["LW","RW"],r:71},{n:"Marc Berdoll",pos:["ST","LW"],r:71},
  {n:"Didier Six",pos:["LW","ST"],r:75},{n:"Bernard Lacombe",pos:["ST","LW"],r:76},
  {n:"Michel Platini",pos:["CAM","CM"],r:88}
 ]}],

 "Haiti_1974":[{y:1974,p:[
  {n:"Henri Françillon",pos:["GK"],r:71},{n:"Fritz André",pos:["GK"],r:70},{n:"Claude Barthélemy",pos:["GK"],r:69},
  {n:"Guy Saint-Vil",pos:["CB","RB"],r:70},{n:"Pierre Bayonne",pos:["CB"],r:70},
  {n:"Wilner Nazaire",pos:["CB"],r:70},{n:"Gérard Joseph",pos:["CB","LB"],r:70},
  {n:"Fritz Leandré",pos:["LB","CB"],r:70},{n:"Jean-Claude Désir",pos:["LB"],r:69},
  {n:"Roger Saint-Vil",pos:["CDM","CM"],r:70},{n:"Guy François",pos:["CM","CDM"],r:70},
  {n:"Jean-Herbert Austin",pos:["CM","CDM"],r:70},{n:"Serge Racine",pos:["CM"],r:70},
  {n:"Arsène Auguste",pos:["CM","LW"],r:70},{n:"Wilfried Louis",pos:["LW","CM"],r:70},
  {n:"Serge Ducosté",pos:["LW","CM"],r:70},{n:"Philippe Vorbe",pos:["LW","RW"],r:71},
  {n:"Joseph-Marion Leandré",pos:["LW","ST"],r:70},{n:"Eddy Antoine",pos:["ST"],r:70},
  {n:"Ernst Jean-Joseph",pos:["CM","CDM"],r:71},{n:"Wilner Piquant",pos:["ST","LW"],r:70},
  {n:"Emmanuel Sanon",pos:["ST"],r:75}
 ]}],

 "Hungary_1978":[{y:1978,p:[
  {n:"Ferenc Mészáros",pos:["GK"],r:74},{n:"András Tóth",pos:["GK"],r:71},{n:"Béla Várady",pos:["GK"],r:70},
  {n:"Sándor Pintér",pos:["RB","CB"],r:72},{n:"Sándor Gujdár",pos:["CB"],r:73},
  {n:"László Bálint",pos:["CB"],r:72},{n:"Győző Martos",pos:["CB","LB"],r:70},
  {n:"István Halász",pos:["LB","CB"],r:70},{n:"Ferenc Fülöp",pos:["LB"],r:70},
  {n:"László Fazekas",pos:["CM","CAM"],r:74},{n:"Károly Csapó",pos:["CDM","CM"],r:70},
  {n:"József Tóth",pos:["CM","CDM"],r:71},{n:"László Kovács",pos:["CM"],r:70},
  {n:"Sándor Zombori",pos:["CM","LW"],r:70},{n:"László Nagy",pos:["LW","CM"],r:70},
  {n:"István Kocsis",pos:["LW","CM"],r:70},{n:"László Pusztai",pos:["LW","RW"],r:70},
  {n:"András Törőcsik",pos:["CAM","LW"],r:76},{n:"Péter Török",pos:["ST","LW"],r:70},
  {n:"Zoltán Kereki",pos:["ST"],r:70},{n:"Tibor Rab",pos:["LW","ST"],r:71},
  {n:"Tibor Nyilasi",pos:["CAM","ST"],r:78}
 ]}],

 "Iran_1978":[{y:1978,p:[
  {n:"Nasser Hejazi",pos:["GK"],r:77},{n:"Bahram Mavaddat",pos:["GK"],r:71},{n:"Rasoul Korbekandi",pos:["GK"],r:70},
  {n:"Hassan Nazari",pos:["RB","CB"],r:71},{n:"Andranik Eskandarian",pos:["CB"],r:74},
  {n:"Hassan Nayebagha",pos:["CB"],r:72},{n:"Ali Reza Ghesghayan",pos:["CB","LB"],r:71},
  {n:"Mohammad Sadeghi",pos:["LB","CB"],r:71},{n:"Hassan Roshan",pos:["LB"],r:70},
  {n:"Ali Parvin",pos:["CDM","CM"],r:77},{n:"Iraj Danaeifard",pos:["CM","CDM"],r:71},
  {n:"Hossein Kazerani",pos:["CM","CDM"],r:70},{n:"Majid Bishkar",pos:["CM"],r:70},
  {n:"Javad Allahverdi",pos:["CM","LW"],r:70},{n:"Behtash Fariba",pos:["LW","CM"],r:70},
  {n:"Hossein Faraki",pos:["LW","CM"],r:70},{n:"Ali Shojaei",pos:["LW","RW"],r:70},
  {n:"Nasrollah Abdollahi",pos:["LW","ST"],r:70},{n:"Ebrahim Ghasempour",pos:["ST"],r:70},
  {n:"Hamid Majd Teymouri",pos:["ST","LW"],r:70},{n:"Nasser Nouraei",pos:["CM","CDM"],r:70},
  {n:"Ghafour Jahani",pos:["ST","LW"],r:74}
 ]}],

 "Israel_1970":[{y:1970,p:[
  {n:"Itzhak Shum",pos:["GK"],r:72},{n:"Giora Spiegel",pos:["GK"],r:70},{n:"Shmuel Rosenthal",pos:["GK"],r:69},
  {n:"Roni Shuruk",pos:["RB","CB"],r:70},{n:"Shraga Bar",pos:["CB"],r:70},
  {n:"Moshe Romano",pos:["CB"],r:70},{n:"David Karako",pos:["CB","LB"],r:70},
  {n:"Yechiel Hameiri",pos:["LB","CB"],r:70},{n:"Yehoshua Feigenbaum",pos:["LB"],r:69},
  {n:"Eli Ben Rimoz",pos:["CDM","CM"],r:70},{n:"David Primo",pos:["CM","CDM"],r:70},
  {n:"Yair Nossovsky",pos:["CM","CDM"],r:70},{n:"Menachem Bello",pos:["CM"],r:69},
  {n:"Danny Shmulevich-Rom",pos:["CM","LW"],r:70},{n:"Yitzchak Vissoker",pos:["LW","CM"],r:70},
  {n:"Zvi Rosen",pos:["LW","RW"],r:70},{n:"Rachamim Talbi",pos:["LW","ST"],r:70},
  {n:"Yechezekel Chazom",pos:["LW","ST"],r:70},{n:"George Borba",pos:["CAM","CM"],r:71},
  {n:"Yochanan Vollach",pos:["LW","ST"],r:71},{n:"Yisha'ayahu Schwager",pos:["CM","LW"],r:70},
  {n:"Mordechai Spiegler",pos:["ST","LW"],r:75}
 ]}],

 "Mexico_1970":[{y:1970,p:[
  {n:"Ignacio Calderón",pos:["GK"],r:74},{n:"Javier Guzmán",pos:["GK"],r:72},{n:"Aarón Padilla",pos:["GK"],r:70},
  {n:"Juan Manuel Alejandrez",pos:["RB","CB"],r:70},{n:"Gustavo Peña",pos:["CB"],r:72},
  {n:"Héctor Pulido",pos:["CB"],r:71},{n:"Francisco Montes",pos:["CB","LB"],r:71},
  {n:"Javier Valdivia",pos:["LB","CB"],r:70},{n:"Mario Velarde",pos:["LB"],r:70},
  {n:"Francisco Castrejón",pos:["CDM","CM"],r:70},{n:"Marcos Rivas",pos:["CM","CDM"],r:70},
  {n:"Antonio Munguía",pos:["CM","CDM"],r:70},{n:"Isidoro Díaz",pos:["CM"],r:70},
  {n:"José Luis González",pos:["CM","LW"],r:70},{n:"Javier Fragoso",pos:["LW","CM"],r:71},
  {n:"Antonio Mota",pos:["LW","RW"],r:71},{n:"Juan Ignacio Basaguren",pos:["LW","ST"],r:70},
  {n:"Guillermo Hernández",pos:["LW","ST"],r:70},{n:"José Vantolrá",pos:["ST"],r:70},
  {n:"Enrique Borja",pos:["ST","LW"],r:74},{n:"Horacio López Salgado",pos:["ST"],r:70},
  {n:"Mario Pérez",pos:["CM","LW"],r:70}
 ]}],

 "Mexico_1978":[{y:1978,p:[
  {n:"José Pilar Reyes",pos:["GK"],r:72},{n:"Alfredo Tena",pos:["GK"],r:71},{n:"Rigoberto Cisneros",pos:["GK"],r:70},
  {n:"Arturo Vázquez Ayala",pos:["RB","CB"],r:71},{n:"Mario Medina",pos:["CB"],r:71},
  {n:"Eduardo Ramos",pos:["CB"],r:70},{n:"Ignacio Flores Ocaranza",pos:["CB","LB"],r:70},
  {n:"Pedro Soto",pos:["LB","CB"],r:70},{n:"Javier Cárdenas",pos:["LB"],r:70},
  {n:"Leonardo Cuéllar",pos:["CDM","CM"],r:72},{n:"Gerardo Lugo",pos:["CM","CDM"],r:70},
  {n:"Guillermo Mendizábal",pos:["CM","CDM"],r:70},{n:"Jesús Martínez",pos:["CM"],r:70},
  {n:"Carlos Gómez",pos:["CM","LW"],r:70},{n:"Raúl Isiordia",pos:["LW","CM"],r:70},
  {n:"Manuel Nájera",pos:["LW","CM"],r:70},{n:"Cristóbal Ortega",pos:["LW","RW"],r:71},
  {n:"Antonio de la Torre",pos:["LW","ST"],r:70},{n:"Hugo René Rodríguez",pos:["ST"],r:70},
  {n:"Enrique López Zarza",pos:["ST","LW"],r:70},{n:"Víctor Rangel",pos:["LW","ST"],r:70},
  {n:"Hugo Sánchez",pos:["ST"],r:77}
 ]}],

 "Morocco_1970":[{y:1970,p:[
  {n:"Allal Ben Kassou",pos:["GK"],r:72},{n:"Driss Bamous",pos:["GK"],r:70},{n:"Moustapha Choukri",pos:["GK"],r:70},
  {n:"Abdelkader El Khiati",pos:["CB","RB"],r:71},{n:"Mohammed Hazzaz",pos:["CB"],r:71},
  {n:"Mohammed Mahroufi",pos:["CB"],r:70},{n:"Abdelkader Ouaraghli",pos:["LB","CB"],r:70},
  {n:"Moulay Khanousi",pos:["CDM","CM"],r:70},{n:"Jalili Fadili",pos:["CM","CDM"],r:70},
  {n:"Maouhoub Ghazouani",pos:["CM","CDM"],r:70},{n:"Ahmed Alaoui",pos:["CM"],r:70},
  {n:"Kacem Slimani",pos:["CM","LW"],r:70},{n:"Mohammed El Filali",pos:["LW","CM"],r:70},
  {n:"Hadi Dahane",pos:["LW","RW"],r:70},{n:"Said Ghandi",pos:["LW","ST"],r:70},
  {n:"Boujemaa Benkhrif",pos:["LW","ST"],r:70},{n:"Houmane Jarir",pos:["ST","LW"],r:72},
  {n:"Abdallah Lamrani",pos:["ST"],r:71},{n:"Ahmed Faras",pos:["LW","ST"],r:75}
 ]}],

 "Peru_1970":[{y:1970,p:[
  {n:"Luis Rubiños",pos:["GK"],r:75},{n:"Oswaldo Ramírez",pos:["GK"],r:72},{n:"Roberto Challe",pos:["GK"],r:70},
  {n:"Pedro González",pos:["RB","CB"],r:72},{n:"Héctor Chumpitaz",pos:["CB"],r:79},
  {n:"Eladio Reyes",pos:["CB"],r:72},{n:"Nicolás Fuentes",pos:["CB","LB"],r:71},
  {n:"Javier González",pos:["LB","CB"],r:70},{n:"Eloy Campos",pos:["LB"],r:70},
  {n:"José Fernández",pos:["CDM","CM"],r:71},{n:"Ramón Mifflin",pos:["CM","CDM"],r:74},
  {n:"Luis Cruzado",pos:["CM","CDM"],r:71},{n:"Pedro Pablo León",pos:["CM"],r:70},
  {n:"Orlando de la Torre",pos:["CM","LW"],r:71},{n:"Jesus Goyzueta",pos:["LW","CM"],r:70},
  {n:"Félix Salinas",pos:["LW","RW"],r:71},{n:"Alberto Gallardo",pos:["LW","ST"],r:74},
  {n:"Rubén Correa",pos:["LW","ST"],r:70},{n:"Julio Baylón",pos:["ST","LW"],r:73},
  {n:"José del Castillo",pos:["ST"],r:71},{n:"Hugo Sotil",pos:["LW","ST"],r:77},
  {n:"Teófilo Cubillas",pos:["CAM","CM"],r:83}
 ]}],

 "Peru_1978":[{y:1978,p:[
  {n:"Ramón Quiroga",pos:["GK"],r:77},{n:"Ottorino Sartor",pos:["GK"],r:72},{n:"Roberto Rojas",pos:["GK"],r:70},
  {n:"Juan Muñante",pos:["RB","RWB"],r:72},{n:"Héctor Chumpitaz",pos:["CB"],r:79},
  {n:"Alfredo Quesada",pos:["CB"],r:72},{n:"Roberto Mosquera",pos:["CB","LB"],r:72},
  {n:"Raúl Gorriti",pos:["LB","CB"],r:71},{n:"Juan Cáceres",pos:["LB"],r:70},
  {n:"Carlos Juan Oblitas",pos:["CDM","CM"],r:73},{n:"José Velásquez",pos:["CM","CDM"],r:73},
  {n:"Rodolfo Manzo",pos:["CM","CDM"],r:71},{n:"Ernesto Labarthe",pos:["CM"],r:70},
  {n:"César Cueto",pos:["CAM","CM"],r:77},{n:"Jaime Duarte",pos:["LW","CM"],r:70},
  {n:"José Navarro",pos:["LW","CM"],r:70},{n:"Germán Leguía",pos:["LW","RW"],r:71},
  {n:"Percy Rojas",pos:["LW","ST"],r:71},{n:"Rubén Toribio Díaz",pos:["ST"],r:71},
  {n:"Hugo Sotil",pos:["LW","ST"],r:76},{n:"Guillermo La Rosa",pos:["ST"],r:74},
  {n:"Teófilo Cubillas",pos:["CAM","CM"],r:84}
 ]}],


 "Poland_1978":[{y:1978,p:[
  {n:"Jan Tomaszewski",pos:["GK"],r:82},{n:"Zdzisław Kostrzewa",pos:["GK"],r:72},{n:"Roman Wójcicki",pos:["GK"],r:71},
  {n:"Antoni Szymanowski",pos:["RB","CB"],r:74},{n:"Władysław Żmuda",pos:["CB"],r:77},
  {n:"Jerzy Gorgoń",pos:["CB"],r:75},{n:"Adam Nawałka",pos:["CDM","CM"],r:75},
  {n:"Bohdan Masztaler",pos:["CM","CDM"],r:71},{n:"Mirosław Justek",pos:["LB","CB"],r:70},
  {n:"Henryk Kasperczak",pos:["CDM","CM"],r:75},{n:"Henryk Maculewicz",pos:["CM","CDM"],r:70},
  {n:"Wojciech Rudy",pos:["CM","CDM"],r:70},{n:"Marek Kusto",pos:["CM"],r:71},
  {n:"Janusz Kupcewicz",pos:["LW","CM"],r:72},{n:"Zygmunt Kukla",pos:["LW","CM"],r:70},
  {n:"Grzegorz Lato",pos:["RW","LW"],r:83},{n:"Andrzej Iwan",pos:["LW","ST"],r:72},
  {n:"Włodzimierz Lubański",pos:["LW","ST"],r:80},{n:"Włodzimierz Mazur",pos:["CM","LW"],r:70},
  {n:"Andrzej Szarmach",pos:["ST"],r:79},{n:"Zbigniew Boniek",pos:["CAM","ST"],r:82},
  {n:"Kazimierz Deyna",pos:["CAM","CM"],r:86}
 ]}],

 "Romania_1970":[{y:1970,p:[
  {n:"Stere Adamache",pos:["GK"],r:75},{n:"Necula Răducanu",pos:["GK"],r:73},{n:"Mihai Mocanu",pos:["GK"],r:70},
  {n:"Radu Nunweiller",pos:["RB","CB"],r:71},{n:"Mihai Ivăncescu",pos:["CB"],r:71},
  {n:"Ion Dumitru",pos:["CB"],r:70},{n:"Lajos Sătmăreanu",pos:["CB","LB"],r:70},
  {n:"Augustin Deleanu",pos:["LB","CB"],r:70},{n:"Vasile Gergely",pos:["LB"],r:70},
  {n:"Alexandru Neagu",pos:["CDM","CM"],r:71},{n:"Cornel Dinu",pos:["CM","CDM"],r:73},
  {n:"Marin Tufan",pos:["CM","CDM"],r:70},{n:"Emerich Dembrovschi",pos:["CM"],r:72},
  {n:"Flavius Domide",pos:["CM","LW"],r:70},{n:"Mircea Lucescu",pos:["CAM","CM"],r:76},
  {n:"Dan Coe",pos:["LW","CM"],r:70},{n:"Gheorghe Tătaru",pos:["LW","RW"],r:70},
  {n:"Gheorghe Gornea",pos:["LW","ST"],r:72},{n:"Nicolae Lupescu",pos:["LW","ST"],r:71},
  {n:"Nicolae Pescaru",pos:["ST"],r:70},{n:"Florea Dumitrache",pos:["ST"],r:73},
  {n:"Nicolae Dobrin",pos:["CAM","CM"],r:77}
 ]}],

 "Scotland_1974":[{y:1974,p:[
  {n:"David Harvey",pos:["GK"],r:75},{n:"Thomson Allan",pos:["GK"],r:72},{n:"Jim Stewart",pos:["GK"],r:70},
  {n:"Sandy Jardine",pos:["RB","CB"],r:78},{n:"Martin Buchan",pos:["CB"],r:77},
  {n:"Jim Holton",pos:["CB"],r:74},{n:"John Blackley",pos:["CB","LB"],r:73},
  {n:"Danny McGrain",pos:["RB","LB"],r:80},{n:"Willie Donachie",pos:["LB","LWB"],r:74},
  {n:"Billy Bremner",pos:["CDM","CM"],r:83},{n:"David Hay",pos:["CM","CDM"],r:76},
  {n:"Peter Cormack",pos:["CM","CDM"],r:73},{n:"Gordon McQueen",pos:["CB","CDM"],r:76},
  {n:"Erich Schaedler",pos:["LB","CM"],r:71},{n:"Willie Morgan",pos:["RW","CM"],r:73},
  {n:"Tommy Hutchison",pos:["LW","CM"],r:73},{n:"Peter Lorimer",pos:["RW","CM"],r:78},
  {n:"Jimmy Johnstone",pos:["RW","LW"],r:78},{n:"Donald Ford",pos:["ST","LW"],r:70},
  {n:"Joe Jordan",pos:["ST"],r:75},{n:"Denis Law",pos:["ST","LW"],r:85},
  {n:"Kenny Dalglish",pos:["ST","LW"],r:84}
 ]}],

 "Scotland_1978":[{y:1978,p:[
  {n:"Alan Rough",pos:["GK"],r:77},{n:"Jim Blyth",pos:["GK"],r:73},{n:"Bobby Clark",pos:["GK"],r:72},
  {n:"Sandy Jardine",pos:["RB","CB"],r:77},{n:"Martin Buchan",pos:["CB"],r:76},
  {n:"Gordon McQueen",pos:["CB"],r:77},{n:"Kenny Burns",pos:["CB"],r:76},
  {n:"Willie Donachie",pos:["LB","LWB"],r:74},{n:"Tom Forsyth",pos:["CB","CDM"],r:73},
  {n:"Stuart Kennedy",pos:["RB","CM"],r:71},{n:"Asa Hartford",pos:["CDM","CM"],r:74},
  {n:"Bruce Rioch",pos:["CM","CDM"],r:74},{n:"Don Masson",pos:["CM","CDM"],r:74},
  {n:"Graeme Souness",pos:["CM","CDM"],r:82},{n:"Derek Johnstone",pos:["CB","ST"],r:73},
  {n:"Archie Gemmill",pos:["CM","CAM"],r:78},{n:"John Robertson",pos:["LW","LM"],r:77},
  {n:"Lou Macari",pos:["CM","ST"],r:74},{n:"Joe Harper",pos:["ST","LW"],r:72},
  {n:"Joe Jordan",pos:["ST"],r:76},{n:"Kenny Dalglish",pos:["ST","LW"],r:87},
  {n:"Willie Johnston",pos:["LW","RW"],r:73}
 ]}],

 "Soviet_Union_1970":[{y:1970,p:[
  {n:"Anzor Kavazashvili",pos:["GK"],r:79},{n:"Lev Yashin",pos:["GK"],r:88},{n:"Leonid Shmuts",pos:["GK"],r:70},
  {n:"Gennady Logofet",pos:["RB","CB"],r:73},{n:"Albert Shesternyov",pos:["CB"],r:80},
  {n:"Murtaz Khurtsilava",pos:["CB"],r:76},{n:"Vladimir Kaplichny",pos:["CB","LB"],r:74},
  {n:"Evgeny Lovchev",pos:["LB","LWB"],r:74},{n:"Revaz Dzodzuashvili",pos:["RB","CDM"],r:73},
  {n:"Gennady Yevriuzhikin",pos:["CDM","CM"],r:72},{n:"Kakhi Asatiani",pos:["CM","CDM"],r:73},
  {n:"Vladimir Muntyan",pos:["CM","CAM"],r:75},{n:"Nikolay Kiselyov",pos:["CM","CDM"],r:70},
  {n:"Valentin Afonin",pos:["CM","CDM"],r:71},{n:"Givi Nodia",pos:["LW","CM"],r:72},
  {n:"Viktor Serebryanikov",pos:["LW","RW"],r:73},{n:"Slava Metreveli",pos:["RW","LW"],r:74},
  {n:"Anatoliy Puzach",pos:["LW","ST"],r:71},{n:"Vitaly Khmelnitsky",pos:["LW","ST"],r:73},
  {n:"Valeriy Porkujan",pos:["ST","LW"],r:72},{n:"Valery Zykov",pos:["ST"],r:71},
  {n:"Anatoliy Byshovets",pos:["ST","LW"],r:78}
 ]}],

 "Spain_1978":[{y:1978,p:[
  {n:"Luis Arconada",pos:["GK"],r:82},{n:"Miguel Ángel",pos:["GK"],r:77},{n:"Urruti",pos:["GK"],r:73},
  {n:"Francisco Javier Uría",pos:["RB","CB"],r:71},{n:"Migueli",pos:["CB"],r:77},
  {n:"Antonio de la Cruz",pos:["CB"],r:72},{n:"Marcelino",pos:["CB","LB"],r:72},
  {n:"Antonio Biosca",pos:["LB","CB"],r:71},{n:"Antonio Olmo",pos:["LB"],r:70},
  {n:"Pirri",pos:["CDM","CM"],r:78},{n:"Dani",pos:["CM","CDM"],r:73},
  {n:"Isidoro San José",pos:["CM","CDM"],r:73},{n:"Carles Rexach",pos:["CM","LW"],r:74},
  {n:"Juan Manuel Asensi",pos:["CAM","CM"],r:77},{n:"Eugenio Leal",pos:["LW","CM"],r:70},
  {n:"Antonio Guzmán",pos:["LW","CM"],r:70},{n:"Juanito",pos:["CAM","LW"],r:78},
  {n:"Julio Cardeñosa",pos:["CAM","CM"],r:74},{n:"Marañón",pos:["LW","ST"],r:71},
  {n:"Rubén Cano",pos:["ST","LW"],r:72},{n:"Santillana",pos:["ST"],r:79},
  {n:"Quini",pos:["ST","LW"],r:80}
 ]}],

 "Tunisia_1978":[{y:1978,p:[
  {n:"Sadok Sassi",pos:["GK"],r:73},{n:"Ohman Chehaibi",pos:["GK"],r:70},{n:"Khaled Gasmi",pos:["GK"],r:70},
  {n:"Ali Kaabi",pos:["RB","CB"],r:71},{n:"Mokhtar Dhouib",pos:["CB"],r:72},
  {n:"Khemais Labidi",pos:["CB"],r:71},{n:"Slah Karoui",pos:["CB","LB"],r:70},
  {n:"Néjib Ghommidh",pos:["LB","CB"],r:71},{n:"Lamine Ben Aziza",pos:["LB"],r:70},
  {n:"Mohamed Akid",pos:["CDM","CM"],r:70},{n:"Ridha El Louze",pos:["CM","CDM"],r:71},
  {n:"Mohsen Labidi",pos:["CM","CDM"],r:71},{n:"Néjib Limam",pos:["CM"],r:70},
  {n:"Mohamed Ben Mouza",pos:["CM","LW"],r:70},{n:"Mokhtar Naili",pos:["LW","CM"],r:70},
  {n:"Mokhtar Hasni",pos:["LW","CM"],r:70},{n:"Amor Jebali",pos:["LW","RW"],r:71},
  {n:"Abderraouf Ben Aziza",pos:["LW","ST"],r:70},{n:"Kamel Chebli",pos:["ST"],r:70},
  {n:"Tarak Dhiab",pos:["CAM","CM"],r:76},{n:"Hamadi Agrebi",pos:["LW","ST"],r:72},
  {n:"Témime Lahzami",pos:["ST","LW"],r:71}
 ]}],

 "Yugoslavia_1974":[{y:1974,p:[
  {n:"Enver Marić",pos:["GK"],r:75},{n:"Branko Oblak",pos:["GK"],r:74},{n:"Franjo Vladić",pos:["GK"],r:70},
  {n:"Jovan Aćimović",pos:["RB","CB"],r:72},{n:"Josip Katalinski",pos:["CB"],r:79},
  {n:"Ivan Buljan",pos:["CB"],r:75},{n:"Luka Peruzović",pos:["CB","LB"],r:73},
  {n:"Enver Hadžiabdić",pos:["LB","LWB"],r:73},{n:"Dražen Mužinić",pos:["LB","CB"],r:71},
  {n:"Vladislav Bogićević",pos:["CDM","CM"],r:75},{n:"Jurica Jerković",pos:["CM","CAM"],r:74},
  {n:"Stanislav Karasi",pos:["CM","CDM"],r:71},{n:"Vladimir Petrović",pos:["CM","CDM"],r:75},
  {n:"Ognjen Petrović",pos:["CM"],r:71},{n:"Kiril Dojčinovski",pos:["CM","LW"],r:70},
  {n:"Miroslav Pavlović",pos:["LW","CM"],r:71},{n:"Rizah Mešković",pos:["LW","RW"],r:71},
  {n:"Danilo Popivoda",pos:["LW","ST"],r:71},{n:"Ilija Petković",pos:["LW","ST"],r:74},
  {n:"Dušan Bajević",pos:["ST"],r:76},{n:"Dragan Džajić",pos:["LW","ST"],r:84},
  {n:"Ivica Šurjak",pos:["LW","ST"],r:74}
 ]}],

 "Zaire_1974":[{y:1974,p:[
  {n:"Kazadi Mwamba",pos:["GK"],r:70},{n:"Tubilandu Ndimbi",pos:["GK"],r:69},{n:"Mwanza Mukombo",pos:["GK"],r:69},
  {n:"Mwape Mialo",pos:["CB","RB"],r:69},{n:"Bwanga Tshimen",pos:["CB"],r:70},
  {n:"Kafula Ngoie",pos:["CB"],r:69},{n:"Lobilo Boba",pos:["CB","LB"],r:69},
  {n:"Kakoko Etepe",pos:["LB","CB"],r:70},{n:"Kabasu Babo",pos:["LB"],r:69},
  {n:"Kilasu Massamba",pos:["CDM","CM"],r:70},{n:"Kidumu Mantantu",pos:["CM","CDM"],r:70},
  {n:"Kalambay Otepa",pos:["CM"],r:69},{n:"Mavuba Mafuila",pos:["CM","LW"],r:70},
  {n:"Mbungu Ekofa",pos:["LW","CM"],r:69},{n:"Mana Mamuwene",pos:["LW","CM"],r:69},
  {n:"Jean Kembo Uba-Kembo",pos:["LW","RW"],r:71},{n:"Kibonge Mafu",pos:["LW","ST"],r:69},
  {n:"Mwepu Ilunga",pos:["CM","CDM"],r:70},{n:"Martin Kamunda Tshinabu",pos:["ST","LW"],r:69},
  {n:"Jean Kalala N'Tumba",pos:["ST"],r:70},{n:"Ndaye Mulamba",pos:["ST","LW"],r:73},
  {n:"Mayanga Maku",pos:["LW","ST"],r:71}
 ]}],

 "Argentina_1966":[{y:1966,p:[
  {n:"Antonio Roma",pos:["GK"],r:77},{n:"Hugo Gatti",pos:["GK"],r:74},{n:"José Varacka",pos:["GK"],r:70},
  {n:"Silvio Marzolini",pos:["LB","LWB"],r:80},{n:"Roberto Perfumo",pos:["CB"],r:78},
  {n:"Rafael Albrecht",pos:["CB"],r:74},{n:"Oscar Calics",pos:["CB","RB"],r:72},
  {n:"Roberto Ferreiro",pos:["RB","CB"],r:71},{n:"Mario Chaldú",pos:["CB","LB"],r:70},
  {n:"Antonio Rattín",pos:["CDM","CM"],r:83},{n:"José Omar Pastoriza",pos:["CM","CDM"],r:75},
  {n:"Alberto González",pos:["CM","CDM"],r:72},{n:"Juan Carlos Sarnari",pos:["CM","CDM"],r:71},
  {n:"Rolando Irusta",pos:["CM","CDM"],r:70},{n:"Aníbal Tarabini",pos:["CM"],r:70},
  {n:"Carmelo Simeone",pos:["CM","LW"],r:71},{n:"Jorge Solari",pos:["LW","CM"],r:73},
  {n:"Nelson López",pos:["LW","RW"],r:71},{n:"Alfredo Rojas",pos:["RW","LW"],r:70},
  {n:"Oscar Más",pos:["LW","ST"],r:74},{n:"Ermindo Onega",pos:["CAM","ST"],r:76},
  {n:"Luis Artime",pos:["ST"],r:79}
 ]}],

 "Bulgaria_1966":[{y:1966,p:[
  {n:"Simeon Simeonov",pos:["GK"],r:73},{n:"Nikola Kotkov",pos:["GK"],r:70},{n:"Stefan Abadzhiev",pos:["GK"],r:69},
  {n:"Dimitar Largov",pos:["RB","CB"],r:71},{n:"Ivan Vutsov",pos:["CB"],r:73},
  {n:"Dimitar Penev",pos:["CB"],r:75},{n:"Dobromir Zhechev",pos:["CB"],r:70},
  {n:"Boris Gaganelov",pos:["LB","CB"],r:71},{n:"Aleksandar Shalamanov",pos:["LB"],r:70},
  {n:"Ivan Davidov",pos:["CDM","CM"],r:70},{n:"Ivan Kolev",pos:["CM","CDM"],r:71},
  {n:"Ivan Deyanov",pos:["CM","CDM"],r:70},{n:"Vasil Metodiev",pos:["CM"],r:70},
  {n:"Stoyan Kitov",pos:["CM","LW"],r:70},{n:"Dinko Dermendzhiev",pos:["LW","CM"],r:70},
  {n:"Evgeni Yanchovski",pos:["LW","RW"],r:70},{n:"Dimitar Yakimov",pos:["LW","CAM"],r:72},
  {n:"Vidin Apostolov",pos:["LW","ST"],r:71},{n:"Aleksandar Kostov",pos:["ST"],r:70},
  {n:"Georgi Naydenov",pos:["ST","LW"],r:70},{n:"Petar Zhekov",pos:["ST"],r:74},
  {n:"Georgi Asparuhov",pos:["LW","ST"],r:77}
 ]}],

 "Chile_1966":[{y:1966,p:[
  {n:"Adán Godoy",pos:["GK"],r:72},{n:"Alberto Valentini",pos:["GK"],r:70},{n:"Hugo Berly",pos:["GK"],r:69},
  {n:"Luis Eyzaguirre",pos:["RB","CB"],r:71},{n:"Armando Tobar",pos:["CB"],r:72},
  {n:"Humberto Cruz",pos:["CB"],r:71},{n:"Pedro Araya",pos:["CB","LB"],r:70},
  {n:"Guillermo Yávar",pos:["LB","CB"],r:70},{n:"Roberto Hodge",pos:["LB"],r:70},
  {n:"Juan Olivares",pos:["CDM","CM"],r:71},{n:"Carlos Campos",pos:["CM","CDM"],r:70},
  {n:"Alberto Fouilloux",pos:["CM","CDM"],r:70},{n:"Humberto Donoso",pos:["CM"],r:70},
  {n:"Jaime Ramírez",pos:["CM","LW"],r:70},{n:"Rubén Marcos",pos:["LW","CM"],r:70},
  {n:"Hugo Villanueva",pos:["LW","RW"],r:70},{n:"Ignacio Prieto",pos:["CAM","CM"],r:73},
  {n:"Orlando Ramírez",pos:["LW","ST"],r:71},{n:"Honorino Landa",pos:["ST","LW"],r:70},
  {n:"Francisco Valdés",pos:["LW","ST"],r:73},{n:"Leonel Sánchez",pos:["LW","ST"],r:76},
  {n:"Elías Figueroa",pos:["CB"],r:77}
 ]}],

 "England_1966":[{y:1966,p:[
  {n:"Gordon Banks",pos:["GK"],r:91},{n:"Ron Springett",pos:["GK"],r:76},{n:"Peter Bonetti",pos:["GK"],r:79},
  {n:"George Cohen",pos:["RB","CB"],r:77},{n:"Jack Charlton",pos:["CB"],r:80},
  {n:"Bobby Moore",pos:["CB","CDM"],r:90},{n:"Ron Flowers",pos:["CB"],r:73},
  {n:"Ray Wilson",pos:["LB","LWB"],r:81},{n:"Jimmy Armfield",pos:["RB","CB"],r:75},
  {n:"Gerry Byrne",pos:["LB","CB"],r:73},{n:"Nobby Stiles",pos:["CDM","CM"],r:77},
  {n:"Alan Ball",pos:["CM","CDM"],r:81},{n:"Norman Hunter",pos:["CDM","CB"],r:79},
  {n:"Martin Peters",pos:["CM","CAM"],r:82},{n:"George Eastham",pos:["CAM","CM"],r:76},
  {n:"Ian Callaghan",pos:["CM","RW"],r:74},{n:"John Connelly",pos:["RW","LW"],r:73},
  {n:"Terry Paine",pos:["RW","CM"],r:73},{n:"Roger Hunt",pos:["ST"],r:78},
  {n:"Jimmy Greaves",pos:["ST"],r:86},{n:"Bobby Charlton",pos:["CM","CAM"],r:88},
  {n:"Geoff Hurst",pos:["ST"],r:81}
 ]}],

 "France_1966":[{y:1966,p:[
  {n:"Marcel Aubour",pos:["GK"],r:74},{n:"Georges Carnus",pos:["GK"],r:73},{n:"Edmond Baraffe",pos:["GK"],r:70},
  {n:"Bernard Bosquier",pos:["CB","RB"],r:74},{n:"Robert Herbin",pos:["CB"],r:73},
  {n:"Robert Budzynski",pos:["CB"],r:71},{n:"Jean-Claude Piumi",pos:["CB","LB"],r:70},
  {n:"Gabriel De Michele",pos:["LB","CB"],r:70},{n:"André Chorda",pos:["LB"],r:70},
  {n:"Lucien Muller",pos:["CDM","CM"],r:74},{n:"Joseph Bonnel",pos:["CM","CDM"],r:71},
  {n:"Johnny Schuth",pos:["CM","CDM"],r:70},{n:"Laurent Robuschi",pos:["CM","CDM"],r:70},
  {n:"Gérard Hausser",pos:["CM","LW"],r:70},{n:"Marcel Artelesa",pos:["LW","CM"],r:70},
  {n:"Yves Herbet",pos:["LW","RW"],r:70},{n:"Jacques Simon",pos:["LW","CAM"],r:73},
  {n:"Didier Couécou",pos:["LW","ST"],r:70},{n:"Héctor De Bourgoing",pos:["ST","LW"],r:70},
  {n:"Nestor Combin",pos:["ST","LW"],r:74},{n:"Jean Djorkaeff",pos:["CAM","CM"],r:75},
  {n:"Philippe Gondet",pos:["ST"],r:73}
 ]}],

 "Hungary_1966":[{y:1966,p:[
  {n:"József Gelei",pos:["GK"],r:78},{n:"Antal Szentmihályi",pos:["GK"],r:76},{n:"Lajos Puskás",pos:["GK"],r:70},
  {n:"Sándor Mátrai",pos:["RB","CB"],r:75},{n:"Kálmán Mészöly",pos:["CB","CDM"],r:79},
  {n:"Benő Káposzta",pos:["CB"],r:73},{n:"Imre Mathesz",pos:["CB","LB"],r:71},
  {n:"Dezső Molnár",pos:["LB","CB"],r:70},{n:"Kálmán Sóvári",pos:["LB"],r:70},
  {n:"Gusztáv Szepesi",pos:["CDM","CM"],r:71},{n:"Kálmán Ihász",pos:["CM","CDM"],r:72},
  {n:"Ferenc Sipos",pos:["CM","CDM"],r:72},{n:"István Nagy",pos:["CM"],r:71},
  {n:"Gyula Rákosi",pos:["CM","LW"],r:71},{n:"Antal Nagy",pos:["LW","CM"],r:70},
  {n:"Zoltán Varga",pos:["CAM","CM"],r:76},{n:"Máté Fenyvesi",pos:["LW","RW"],r:74},
  {n:"István Géczi",pos:["LW","ST"],r:71},{n:"János Farkas",pos:["LW","ST"],r:75},
  {n:"Lajos Tichy",pos:["ST"],r:76},{n:"Ferenc Bene",pos:["LW","ST"],r:80},
  {n:"Flórián Albert",pos:["ST","CAM"],r:86}
 ]}],

 "Mexico_1966":[{y:1966,p:[
  {n:"Antonio Carbajal",pos:["GK"],r:76},{n:"Ignacio Calderón",pos:["GK"],r:73},{n:"Ignacio Jáuregui",pos:["GK"],r:70},
  {n:"Felipe Ruvalcaba",pos:["RB","CB"],r:70},{n:"Gustavo Peña",pos:["CB"],r:71},
  {n:"Ernesto Cisneros",pos:["CB"],r:70},{n:"Elías Muñoz",pos:["CB","LB"],r:70},
  {n:"Magdaleno Mercado",pos:["LB","CB"],r:70},{n:"Aarón Padilla",pos:["LB"],r:70},
  {n:"Gabriel Núñez",pos:["CDM","CM"],r:70},{n:"Jesús del Muro",pos:["CM","CDM"],r:70},
  {n:"Luis Regueiro",pos:["CM","CDM"],r:70},{n:"Ramiro Navarro",pos:["CM"],r:69},
  {n:"Francisco Jara",pos:["CM","LW"],r:70},{n:"Salvador Reyes",pos:["LW","CM"],r:70},
  {n:"Isidoro Díaz",pos:["LW","RW"],r:70},{n:"Arturo Chaires",pos:["LW","ST"],r:71},
  {n:"Javier Fragoso",pos:["LW","ST"],r:70},{n:"Javier Vargas",pos:["ST"],r:70},
  {n:"José Luis González",pos:["CM","CAM"],r:70},{n:"Guillermo Hernández",pos:["LW","ST"],r:70},
  {n:"Enrique Borja",pos:["ST"],r:72}
 ]}],

 "North_Korea_1966":[{y:1966,p:[
  {n:"Chang-myung Lee",pos:["GK"],r:72},{n:"Chang-kil Ryoo",pos:["GK"],r:70},{n:"Seung-Il Kim",pos:["GK"],r:69},
  {n:"Se-bok An",pos:["RB","CB"],r:70},{n:"Zoong-sun Lim",pos:["CB"],r:70},
  {n:"Yoon-kyung Oh",pos:["CB"],r:70},{n:"Seung-zin Pak",pos:["CB","LB"],r:70},
  {n:"Keun-hak Lee",pos:["LB","CB"],r:70},{n:"Jung-won Ha",pos:["LB"],r:70},
  {n:"Bong-chil Kang",pos:["CDM","CM"],r:71},{n:"Chi-an Li",pos:["CM","CDM"],r:71},
  {n:"Ryong-woon Kang",pos:["CM","CDM"],r:70},{n:"Seung-hwi Im",pos:["CM"],r:70},
  {n:"Seung-kook Yang",pos:["CM","LW"],r:71},{n:"Seung-woon Ke",pos:["LW","CM"],r:70},
  {n:"Dong-woon Li",pos:["LW","RW"],r:70},{n:"Yung-kil Kim",pos:["LW","CAM"],r:70},
  {n:"Yung-kyoo Shin",pos:["LW","ST"],r:70},{n:"Li-sup Pak",pos:["ST","LW"],r:72},
  {n:"Doo-ik Pak",pos:["CAM","CM"],r:73},{n:"Bong-zin Han",pos:["LW","ST"],r:70},
  {n:"Bong-hwan Kim",pos:["ST"],r:72}
 ]}],

 "Portugal_1966":[{y:1966,p:[
  {n:"Américo",pos:["GK"],r:78},{n:"Custódio Pinto",pos:["GK"],r:73},{n:"Alberto Festa",pos:["GK"],r:70},
  {n:"João Morais",pos:["RB","RWB"],r:74},{n:"Alexandre Baptista",pos:["CB"],r:72},
  {n:"Germano",pos:["CB"],r:77},{n:"José Pereira",pos:["CB","LB"],r:72},
  {n:"Fernando Cruz",pos:["LB","LWB"],r:73},{n:"António Simões",pos:["LW","CAM"],r:79},
  {n:"Hilário",pos:["LB","LWB"],r:74},{n:"Mário Coluna",pos:["CDM","CM"],r:82},
  {n:"Vicente",pos:["CM","CDM"],r:71},{n:"Jaime Graça",pos:["CM","CDM"],r:73},
  {n:"Joaquim Carvalho",pos:["CM","CDM"],r:71},{n:"João Lourenço",pos:["CM"],r:70},
  {n:"Ernesto Figueiredo",pos:["LW","CM"],r:71},{n:"Fernando Peres",pos:["LW","RW"],r:71},
  {n:"José Augusto",pos:["RW","LW"],r:77},{n:"José Carlos",pos:["LW","ST"],r:72},
  {n:"Manuel Duarte",pos:["ST"],r:71},{n:"José Torres",pos:["ST"],r:76},
  {n:"Eusébio",pos:["ST","RW"],r:94}
 ]}],

 "Soviet_Union_1966":[{y:1966,p:[
  {n:"Lev Yashin",pos:["GK"],r:90},{n:"Anzor Kavazashvili",pos:["GK"],r:77},{n:"Viktor Bannikov",pos:["GK"],r:74},
  {n:"Vladimir Ponomaryov",pos:["RB","CB"],r:73},{n:"Albert Shesternyov",pos:["CB"],r:81},
  {n:"Murtaz Khurtsilava",pos:["CB"],r:75},{n:"Valentin Afonin",pos:["CB","LB"],r:72},
  {n:"Vasiliy Danilov",pos:["LB","CB"],r:70},{n:"Leonid Ostrovskiy",pos:["LB"],r:70},
  {n:"Yozhef Sabo",pos:["CDM","CM"],r:76},{n:"Valery Voronin",pos:["CM","CDM"],r:79},
  {n:"Galimzyan Khusainov",pos:["CM","CDM"],r:74},{n:"Georgi Sichinava",pos:["CM"],r:70},
  {n:"Alexey Korneyev",pos:["CM","LW"],r:71},{n:"Eduard Markarov",pos:["LW","CAM"],r:76},
  {n:"Slava Metreveli",pos:["RW","LW"],r:75},{n:"Viktor Serebryanikov",pos:["LW","RW"],r:73},
  {n:"Viktor Getmanov",pos:["ST","LW"],r:71},{n:"Valeriy Porkujan",pos:["ST","LW"],r:72},
  {n:"Eduard Malofeyev",pos:["ST"],r:73},{n:"Igor Chislenko",pos:["RW","LW"],r:76},
  {n:"Anatoliy Banishevskiy",pos:["ST"],r:76}
 ]}],

 "Spain_1966":[{y:1966,p:[
  {n:"José Ángel Iribar",pos:["GK"],r:80},{n:"Antonio Betancort",pos:["GK"],r:73},{n:"Miguel Reina",pos:["GK"],r:74},
  {n:"Feliciano Rivilla",pos:["RB","CB"],r:73},{n:"Ferran Olivella",pos:["CB"],r:74},{n:"Ignacio Zoco",pos:["CB","CDM"],r:75},
  {n:"Manuel Sanchís",pos:["LB","CB"],r:74},{n:"Gallego",pos:["LB"],r:70},
  {n:"Jesús Glaría",pos:["CDM","CM"],r:71},{n:"Pirri",pos:["CM","CAM"],r:77},
  {n:"Luis del Sol",pos:["CM","CDM"],r:76},{n:"Adelardo",pos:["CM","CDM"],r:73},
  {n:"Severino Reija",pos:["CM","LW"],r:70},{n:"Carlos Lapetra",pos:["LW","CM"],r:72},
  {n:"Eladio",pos:["LW","CM"],r:70},{n:"José Ufarte",pos:["LW","RW"],r:72},
  {n:"Josep Maria Fusté",pos:["CM","CAM"],r:74},{n:"Marcelino",pos:["ST"],r:75},
  {n:"Joaquín Peiró",pos:["ST","LW"],r:73},{n:"Francisco Gento",pos:["LW","LM"],r:84},
  {n:"Amancio",pos:["RW","LW"],r:79},{n:"Luis Suárez",pos:["CM","CAM"],r:83}
 ]}],

 "Switzerland_1966":[{y:1966,p:[
  {n:"Karl Elsener",pos:["GK"],r:72},{n:"René-Pierre Quentin",pos:["GK"],r:70},{n:"Georges Vuilleumier",pos:["GK"],r:70},
  {n:"Willy Allemann",pos:["RB","CB"],r:70},{n:"Hansruedi Führer",pos:["CB"],r:71},
  {n:"Robert Hosp",pos:["CB"],r:70},{n:"Xavier Stierli",pos:["CB","LB"],r:70},
  {n:"Werner Leimgruber",pos:["LB","CB"],r:70},{n:"Ely Tacchella",pos:["LB"],r:70},
  {n:"André Grobéty",pos:["CDM","CM"],r:70},{n:"Kurt Armbruster",pos:["CM","CDM"],r:70},
  {n:"Jean-Claude Schindelholz",pos:["CM","CDM"],r:70},{n:"Richard Dürr",pos:["CM"],r:70},
  {n:"Mario Prosperi",pos:["CM","LW"],r:70},{n:"René Brodmann",pos:["LW","CM"],r:70},
  {n:"Fritz Künzli",pos:["LW","RW"],r:71},{n:"Heinz Bäni",pos:["LW","CAM"],r:71},
  {n:"Vittore Gottardi",pos:["LW","ST"],r:70},{n:"Léo Eichmann",pos:["ST"],r:71},
  {n:"Heinz Schneiter",pos:["ST","LW"],r:70},{n:"Karl Odermatt",pos:["LW","ST"],r:73},
  {n:"Köbi Kuhn",pos:["CAM","CM"],r:74}
 ]}],

};

// Map NP to NATION_POOL format
// Expand a player's pos array with all natural aliases.
// LB → also LWB. RB → also RWB. LW → also LM. RW → also RM.
// LWB → also LB. RWB → also RB. LM → also LW. RM → also RW.
// This runs once at startup so all matching (slot chooser, eligibility, modal filter) just uses .includes()
const expandPos=(posArr)=>{
  const aliases={"LB":["LWB"],"RB":["RWB"],"LW":["LM"],"RW":["RM"],"LWB":["LB"],"RWB":["RB"],"LM":["LW"],"RM":["RW"]};
  const out=new Set(posArr);
  posArr.forEach(p=>{(aliases[p]||[]).forEach(a=>out.add(a));});
  return Array.from(out);
};
// Build NATION_POOL: strip underscore suffixes (e.g. "Argentina_1978" → "Argentina")
// so all entries for a nation are grouped under the clean name
const NATION_POOL = (()=>{
  const pool={};
  Object.entries(NP).forEach(([rawKey, entries])=>{
    // Strip _YEAR suffix if present (e.g. "Brazil_1958" → "Brazil", "West Germany" stays)
    const nation=rawKey.replace(/_\d{4}$/,'');
    if(!pool[nation])pool[nation]=[];
    entries.forEach(e=>{
      pool[nation].push({
        year:e.y,
        players:e.p.map(pl=>({name:pl.n,pos:expandPos(pl.pos),rating:pl.r}))
      });
    });
  });
  return pool;
})();
// Base nation years — all combinations
const ALL_NATION_YEARS = Object.entries(NATION_POOL).flatMap(([nation,entries])=>entries.map(e=>({nation,year:e.year})));

// All nation-years get equal weight. The pool is now large enough (~50 nations, multiple eras)
// that natural shuffling provides variety without biasing toward any group.
const buildShuffledPool=()=>{
  const pool=[...ALL_NATION_YEARS]; // equal weight — one copy each
  // Fisher-Yates shuffle for true randomness
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool;
};
// Used during draft — rebuilt each time a new draft starts
let NATION_YEARS=buildShuffledPool();


const WC2026_GROUPS = [
  {id:"A",teams:[{name:"Mexico",rating:80,flag:"🇲🇽"},{name:"South Korea",rating:78,flag:"🇰🇷"},{name:"South Africa",rating:72,flag:"🇿🇦"},{name:"Czechia",rating:76,flag:"🇨🇿"}]},
  {id:"B",teams:[{name:"Canada",rating:76,flag:"🇨🇦"},{name:"Switzerland",rating:81,flag:"🇨🇭"},{name:"Qatar",rating:70,flag:"🇶🇦"},{name:"Bosnia-Herz.",rating:74,flag:"🇧🇦"}]},
  {id:"C",teams:[{name:"Brazil",rating:85,flag:"🇧🇷"},{name:"Morocco",rating:80,flag:"🇲🇦"},{name:"Haiti",rating:63,flag:"🇭🇹"},{name:"Scotland",rating:74,flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿"}]},
  {id:"D",teams:[{name:"United States",rating:79,flag:"🇺🇸"},{name:"Paraguay",rating:75,flag:"🇵🇾"},{name:"Australia",rating:74,flag:"🇦🇺"},{name:"Turkiye",rating:77,flag:"🇹🇷"}]},
  {id:"E",teams:[{name:"Germany",rating:84,flag:"🇩🇪"},{name:"Curacao",rating:62,flag:"🇨🇼"},{name:"Ivory Coast",rating:76,flag:"🇨🇮"},{name:"Ecuador",rating:75,flag:"🇪🇨"}]},
  {id:"F",teams:[{name:"Netherlands",rating:82,flag:"🇳🇱"},{name:"Japan",rating:78,flag:"🇯🇵"},{name:"Sweden",rating:76,flag:"🇸🇪"},{name:"Tunisia",rating:72,flag:"🇹🇳"}]},
  {id:"G",teams:[{name:"Belgium",rating:82,flag:"🇧🇪"},{name:"Egypt",rating:73,flag:"🇪🇬"},{name:"Iran",rating:72,flag:"🇮🇷"},{name:"New Zealand",rating:65,flag:"🇳🇿"}]},
  {id:"H",teams:[{name:"Spain",rating:86,flag:"🇪🇸"},{name:"Cape Verde",rating:69,flag:"🇨🇻"},{name:"Saudi Arabia",rating:73,flag:"🇸🇦"},{name:"Uruguay",rating:82,flag:"🇺🇾"}]},
  {id:"I",teams:[{name:"France",rating:87,flag:"🇫🇷"},{name:"Senegal",rating:79,flag:"🇸🇳"},{name:"Iraq",rating:68,flag:"🇮🇶"},{name:"Norway",rating:77,flag:"🇳🇴"}]},
  {id:"J",teams:[{name:"Argentina",rating:86,flag:"🇦🇷"},{name:"Algeria",rating:74,flag:"🇩🇿"},{name:"Austria",rating:78,flag:"🇦🇹"},{name:"Jordan",rating:67,flag:"🇯🇴"}]},
  {id:"K",teams:[{name:"Portugal",rating:86,flag:"🇵🇹"},{name:"DR Congo",rating:70,flag:"🇨🇩"},{name:"Uzbekistan",rating:68,flag:"🇺🇿"},{name:"Colombia",rating:82,flag:"🇨🇴"}]},
  {id:"L",teams:[{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},{name:"Croatia",rating:80,flag:"🇭🇷"},{name:"Ghana",rating:72,flag:"🇬🇭"},{name:"Panama",rating:67,flag:"🇵🇦"}]},
];

// 2026 World Cup squad rosters — used for all opponent player name attribution
const OPP_PLAYERS_2026 = {
  "Algeria":["Achraf Abada","Adil Boulbina","Aissa Mandi","Amine Gouiri","Anis Hadj Moussa","Fares Chaïbi","Fares Ghedjemis","Hicham Boudaoui","Houssem Aouar","Ibrahim Maza","Jaouen Hadjam","Luca Zidane","Melvin Mastil","Mohamed Amine Tougai","Mohamed Amoura","Nabil Bentaleb","Nadhir Benbouali","Oussama Benbot","Ramiz Zerrouki","Ramy Bensebaïni","Rayan Aït-Nouri","Raïk Belghali","Riyad Mahrez","Samir Chergui","Yassine Titraoui","Zineddine Belaïd"],
  "Argentina":["Alexis Mac Allister","Cristian Romero","Emiliano Martínez","Enzo Fernández","Exequiel Palacios","Facundo Medina","Gerónimo Rulli","Giovani Lo Celso","Giuliano Simeone","Gonzalo Montiel","José Manuel López","Juan Musso","Julián Álvarez","Lautaro Martínez","Leandro Paredes","Leonardo Balerdi","Lionel Messi","Lisandro Martínez","Nahuel Molina","Nico González","Nico Paz","Nicolás Otamendi","Nicolás Tagliafico","Rodrigo De Paul","Thiago Almada","Valentín Barco"],
  "Australia":["Aiden O'Neill","Ajdin Hrustic","Alessandro Circati","Awer Mabil","Aziz Behich","Cameron Burgess","Cameron Devlin","Connor Metcalfe","Cristian Volpato","Harry Souttar","Jackson Irvine","Jacob Taliano","Jason Geria","Jordan Bos","Kai Trewin","Lucas Herrington","Mathew Leckie","Mathew Ryan","Milos Degenek","Mohamed Touré","Nestory Irankunda","Nishan Velupillay","Patrick Beach","Paul Izzo","Paul Okon-Engstler","Tete Yengi"],
  "Austria":["Alessandro Schöpf","Alexander Prass","Alexander Schlager","Carney Chukwuemeka","Christoph Baumgartner","David Affengruber","David Alaba","Florian Grillitsch","Florian Wiegele","Kevin Danso","Konrad Laimer","Marcel Sabitzer","Marco Friedl","Marko Arnautović","Michael Gregoritsch","Michael Svoboda","Nicolas Seiwald","Patrick Pentz","Patrick Wimmer","Paul Wanner","Philipp Lienhart","Phillip Mwene","Romano Schmid","Saša Kalajdžić","Stefan Posch","Xaver Schlager"],
  "Belgium":["Alexis Saelemaekers","Amadou Onana","Arthur Theate","Axel Witsel","Brandon Mechele","Charles De Ketelaere","Diego Moreira","Dodi Lukebakio","Hans Vanaken","Jeremy Doku","Joaquin Seys","Kevin De Bruyne","Koni De Winter","Leandro Trossard","Matias Fernandez-Pardo","Maxim De Cuyper","Mike Penders","Nathan Ngoy","Nicolas Raskin","Romelu Lukaku","Senne Lammens","Thibaut Courtois","Thomas Meunier","Timothy Castagne","Youri Tielemans","Zeno Debast"],
  "Bosnia-Herz.":["Amar Dedić","Amar Memić","Amir Hadžiahmetović","Armin Gigović","Benjamin Tahirović","Dennis Hadžikadunić","Dženis Burnić","Edin Džeko","Ermedin Demirović","Ermin Mahmić","Esmir Bajraktarević","Haris Tabaković","Ivan Bašić","Ivan Šunjić","Jovo Lukić","Kerim Alajbegović","Martin Zlomislić","Mladen Jurkas","Nidal Čelik","Nihad Mujakić","Nikola Katić","Nikola Vasilj","Samed Baždar","Sead Kolašinac","Stjepan Radeljić","Tarik Muharemović"],
  "Brazil":["Alex Sandro","Alisson","Bremer","Bruno Guimarães","Casemiro","Danilo","Danilo Santos","Douglas Santos","Ederson","Endrick","Fabinho","Gabriel Magalhães","Gabriel Martinelli","Igor Thiago","Lucas Paquetá","Luiz Henrique","Léo Pereira","Marquinhos","Matheus Cunha","Neymar Jr","Raphinha","Rayan","Roger Ibañez","Vinicius Junior","Wesley","Weverton"],
  "Canada":["Alfie Jones","Ali Ahmed","Alistair Johnston","Alphonso Davies","Cyle Larin","Dayne St. Clair","Derek Cornelius","Ismaël Koné","Jacob Shaffelburg","Joel Waterman","Jonathan David","Jonathan Osorio","Liam Millar","Luc de Fougerolles","Mathieu Choinière","Maxime Crépeau","Moïse Bombito","Nathan Saliba","Niko Sigur","Owen Goodman","Promise David","Richie Laryea","Stephen Eustáquio","Tajon Buchanan","Tani Oluwaseyi"],
  "Cape Verde":["CJ dos Santos","Dailon Livramiento","Deroy Duarte","Edilson Borges","Garry Rodrigues","Gilson Benchimol","Hélio Varela","Ianique Stopira","Jamiro Monteiro","Jovane Cabral","João Paulo","Kelvin Pires","Kevin Pina","Laros Duarte","Logan Costa","Márcio Rosa","Nuno da Costa","Roberto Lopes","Ryan Mendes","Sidny Lopes Cabral","Steven Moreira","Telmo Arcanjo","Vozinha","Wagner Pina","Willy Semedo","Yannick Semedo"],
  "Colombia":["Andrés Gómez","Camilo Vargas","Cucho Hernández","Daniel Muñoz","David Ospina","Davinson Sánchez","Deiver Machado","Gustavo Puerta","James Rodríguez","Jaminton Campaz","Jefferson Lerma","Jhon Arias","Jhon Córdoba","Jhon Lucumí","Johan Mojica","Jorge Carrascal","Juan Fernando Quintero","Juan Portilla","Kevin Castaño","Luis Díaz","Luis Suárez","Richard Ríos","Santiago Arias","Willer Ditta","Yerry Mina","Álvaro Montero"],
  "Croatia":["Andrej Kramarić","Ante Budimir","Dominik Kotarski","Dominik Livaković","Duje Ćaleta-Car","Igor Matanović","Ivan Perišić","Ivor Pandur","Josip Stanišić","Josip Šutalo","Joško Gvardiol","Kristijan Jakić","Luka Modrić","Luka Sučić","Luka Vušković","Marco Pašalić","Marin Pongračić","Mario Pašalić","Martin Baturina","Martin Erlić","Mateo Kovačić","Nikola Moro","Nikola Vlašić","Petar Musa","Petar Sučić","Toni Fruk"],
  "Curacao":["Ar'jany Martha","Armando Obispo","Brandley Kuwas","Deveron Fonville","Eloy Room","Gervane Kastaneer","Godfried Roemeratoe","Jearl Margaritha","Jeremy Antonisse","Joshua Brenet","Juninho Bacuna","Juriën Gaari","Jürgen Locadia","Kenji Gorré","Kevin Felida","Leandro Bacuna","Livano Comenencia","Riechedly Bazoer","Roshon van Eijma","Sherel Floranus","Shurandy Sambo","Sontje Hansen","Tahith Chong","Trevor Doornbusch","Tyrese Noslin","Tyrick Bodak"],
  "Czechia":["Adam Hložek","Alexandr Sojka","David Douděra","David Jurásek","David Zima","Denis Višinský","Hugo Sochůrek","Jan Kuchta","Jaroslav Zelený","Jindřich Staněk","Ladislav Krejčí","Lukáš Horníček","Lukáš Provod","Lukáš Červ","Matěj Kovář","Michal Sadílek","Mojmír Chytil","Patrik Schick","Pavel Šulc","Robin Hranáč","Tomáš Chorý","Tomáš Holeš","Tomáš Souček","Vladimír Coufal","Vladimír Darida","Štěpán Chaloupek"],
  "DR Congo":["Aaron Tshibola","Aaron Wan-Bissaka","Arthur Masuaku","Axel Tuanzebe","Brian Cipenga","Chancel Mbemba","Charles Pickel","Cédric Bakambu","Dylan Batubinsika","Edo Kayembe","Fiston Mayele","Gaël Kakuta","Gédéon Kalulu","Joris Kayembe","Lionel Mpasi","Matthieu Epolo","Meschak Elia","Nathanaël Mbuku","Ngal'ayel Mukau","Noah Sadiki","Samuel Moutoussamy","Simon Banza","Steve Kapuadi","Théo Bongonda","Timothy Fayulu","Yoane Wissa"],
  "Ecuador":["Alan Franco","Alan Minda","Anthony Valencia","Denil Castillo","Enner Valencia","Félix Torres","Gonzalo Plata","Gonzalo Valle","Hernán Galíndez","Jackson Porozo","Jeremy Arévalo","Joel Ordóñez","John Yeboah","Jordy Alcívar","Jordy Caicedo","Kendry Páez","Kevin Rodríguez","Moisés Caicedo","Moisés Ramírez","Nilson Angulo","Pedro Vite","Pervis Estupiñán","Piero Hincapié","Willian Pacho","Yaimar Medina","Ángelo Preciado"],
  "Egypt":["Ahmed Fatouh","El Mahdy Soliman","Emam Ashour","Haissem Hassan","Hamdy Fathy","Hamza Abdelkarim","Hossam Abdelmaguid","Ibrahim Adel","Karim Hafez","Mahmoud Saber","Marwan Attia","Mohamed Abdelmonem","Mohamed Alaa","Mohamed El Shenawy","Mohamed Hany","Mohamed Salah","Mohanad Lasheen","Mostafa Shobeir","Mostafa Ziko","Nabil Emad","Omar Marmoush","Ramy Rabia","Tarek Alaa","Trézéguet","Yasser Ibrahim","Zizo"],
  "England":["Anthony Gordon","Bukayo Saka","Dan Burn","Dean Henderson","Declan Rice","Djed Spence","Eberechi Eze","Elliot Anderson","Ezri Konsa","Harry Kane","Ivan Toney","James Trafford","Jarell Quansah","John Stones","Jordan Henderson","Jordan Pickford","Jude Bellingham","Kobbie Mainoo","Marc Guéhi","Marcus Rashford","Morgan Rogers","Nico O'Reilly","Noni Madueke","Ollie Watkins","Reece James","Tino Livramento"],
  "France":["Adrien Rabiot","Aurélien Tchouaméni","Bradley Barcola","Brice Samba","Dayot Upamecano","Désiré Doué","Ibrahima Konaté","Jean-Philippe Mateta","Jules Koundé","Kylian Mbappé","Lucas Digne","Lucas Hernandez","Maghnes Akliouche","Malo Gusto","Manu Koné","Marcus Thuram","Maxence Lacroix","Michael Olise","Mike Maignan","N'Golo Kanté","Ousmane Dembélé","Rayan Cherki","Robin Risser","Théo Hernandez","Warren Zaïre-Emery","William Saliba"],
  "Germany":["Aleksandar Pavlović","Alexander Nübel","Angelo Stiller","Antonio Rüdiger","Assan Ouédraogo","David Raum","Deniz Undav","Felix Nmecha","Florian Wirtz","Jamal Musiala","Jamie Leweling","Jonathan Tah","Joshua Kimmich","Kai Havertz","Leon Goretzka","Leroy Sané","Malick Thiaw","Manuel Neuer","Maximilian Beier","Nadiem Amiri","Nathaniel Brown","Nick Woltemade","Nico Schlotterbeck","Oliver Baumann","Pascal Groß","Waldemar Anton"],
  "Ghana":["Abdul Fatawu","Abdul Mumin","Abdul Rahman Baba","Alidu Seidu","Antoine Semenyo","Augustine Boakye","Benjamin Asare","Brandon Thomas-Asante","Caleb Yirenkyi","Christopher Bonsu Baah","Derrick Luckassen","Elisha Owusu","Ernest Nuamah","Gideon Mensah","Iñaki Williams","Jerome Opoku","Jonas Adjetey","Jordan Ayew","Joseph Anang","Kamaldeen Sulemana","Kojo Peprah Oppong","Kwasi Sibo","Lawrence Ati-Zigi","Marvin Senaya","Prince Kwabena Adu","Thomas Partey"],
  "Haiti":["Alexandre Pierre","Carl Sainté","Carlens Arcus","Danley Jean Jacques","Derrick Etienne Jr.","Dominique Simon","Duckens Nazon","Duke Lacroix","Frantzdy Pierrot","Hannes Delcroix","Jean-Kévin Duverne","Jean-Ricner Bellegarde","Johny Placide","Josué Casimir","Josué Duverger","Keeto Thermoncy","Lenny Joseph","Leverton Pierre","Louicius Deedson","Martin Expérience","Ricardo Adé","Ruben Providence","Wilguens Paugain","Wilson Isidor","Woodensky Pierre","Yassin Fortuné"],
  "Iran":["Ali Alipour","Ali Nemati","Alireza Beiranvand","Alireza Jahanbakhsh","Amirhossein Hosseinzadeh","Amirmohammad Razzaghinia","Aria Yousefi","Danial Eiri","Dennis Eckert","Ehsan Hajsafi","Hossein Hosseini","Hossein Kanaanizadegan","Mehdi Ghayedi","Mehdi Taremi","Mehdi Torabi","Milad Mohammadi","Mohammad Ghorbani","Mohammad Mohebi","Payam Niazmand","Ramin Rezaeian","Rouzbeh Cheshmi","Saeid Ezatolahi","Saleh Hardani","Saman Ghoddos","Shahriyar Moghanlou","Shojae Khalilzadeh"],
  "Iraq":["Ahmed Basil","Ahmed Maknzi","Ahmed Qasem","Aimar Sher","Akam Hashim","Ali Al-Hamadi","Ali Jasim","Ali Yousif","Amir Al-Ammari","Aymen Hussein","Fahad Talib","Frans Putros","Hussein Ali","Ibrahim Bayesh","Jalal Hassan","Kevin Yakob","Manaf Younis","Marko Farji","Merchas Doski","Mohanad Ali","Mustafa Saadoon","Rebin Sulaka","Youssef Amyn","Zaid Ismail","Zaid Tahseen","Zidane Iqbal"],
  "Ivory Coast":["Alban Lafont","Amad Diallo","Ange-Yoan Bonny","Bazoumana Touré","Christ Inao Oulaï","Christopher Opéri","Elye Wahi","Emmanuel Agbadou","Evan Ndicka","Evann Guessand","Franck Kessié","Ghislain Konan","Guéla Doué","Ibrahim Sangaré","Jean Michaël Seri","Mohamed Koné","Nicolas Pépé","Odilon Kossounou","Oumar Diakité","Ousmane Diomande","Parfait Guiagon","Seko Fofana","Simon Adingra","Wilfried Singo","Yahia Fofana","Yan Diomande"],
  "Japan":["Doan Ritsu","Endo Wataru","Goto Keisuke","Hayakawa Tomoki","Kamada Daichi","Kubo Takefusa","Maeda Daizen","Nagatomo Yuto","Nakamura Keito","Ogawa Koki","Osako Keisuke","Sano Kaishu","Seko Ayumu","Shiogai Kento","Sugawara Yukinari","Suzuki Junnosuke","Suzuki Yuito","Suzuki Zion","Takura Kou","Tanaka Ao","Taniguchi Shogo","To Hiroki","To Junya","Tomiyasu Takehiro","Ueda Ayase","Watanabe Tsuyoshi"],
  "Jordan":["Abdallah Alfakhori","Abdallah Nasib","Ali Azaizeh","Ali Olwan","Amer Jamous","Anas Badawi","Ehsan Haddad","Husam Abudahab","Ibrahim Sabra","Ibrahim Sadeh","Mahmoud Almardi","Mohammad Abualnadi","Mohammad Abuhasheesh","Mohammad Abuzraiq","Mohammad Aldaoud","Mohannad Abutaha","Mousa Altamari","Nizar Alrashdan","Noor Alrawabdeh","Nour Baniateyah","Odeh Fakhouri","Raja'ei Ayed","Sa'ed Alrosan","Saleem Obaid","Yazan Alarab","Yazeed Abulaila"],
  "Mexico":["Alexis Vega","Armando González","Brian Gutiérrez","Carlos Acevedo","César Huerta","César Montes","Edson Álvarez","Gilberto Mora","Guillermo Martínez","Guillermo Ochoa","Israel Reyes","Jesús Gallardo","Johan Vásquez","Jorge Sánchez","Julián Quiñones","Luis Chávez","Luis Romo","Mateo Chávez","Obed Vargas","Orbelín Pineda","Raúl Jiménez","Raúl Rangel","Roberto Alvarado","Santiago Giménez","Álvaro Fidalgo","Érik Lira"],
  "Morocco":["Aguerd Nayef","Amaimouni Ayoube","Amrabat Sofyan","Belammari Youssef","Bouaddi Ayyoub","Bounou Yassine","Diaz Brahim","Diop Issa","El Aynaoui Neil","El Kaabi Ayoub","El Kajioui Munir","El Khannouss Bilal","El Mourabet Samir","El Ouahdi Zakaria","Ezzalzouli Abde","Hakimi Achraf","Halhal Redouane","Mazraoui Noussair","Ounahi Azzedine","Rahimi Soufiane","Riad Chadi","Saibari Ismael","Salah Eddine Anass","Tagnaouti Ahmed Reda","Talbi Chemsdine","Yassine Gessime"],
  "Netherlands":["Ake Nathan","Brobbey Brian","De Jong Frenkie","De Roon Marten","Depay Memphis","Dumfries Denzel","Flekken Mark","Gakpo Cody","Gravenberch Ryan","Hato Jorrel","Kluivert Justin","Koopmeiners Teun","Lang Noa","Malen Donyell","Reijnders Tijjani","Roefs Robin","Summerville Crysencio","Til Guus","Timber Jurrien","Timber Quinten","Van De Ven Micky","Van Dijk Virgil","Van Hecke Jan Paul","Verbruggen Bart","Weghorst Wout","Wieffer Mats"],
  "New Zealand":["Barbarouses Kosta","Bell Joe","Bindon Tyler","Boxall Michael","Cacace Liberato","Crocombe Max","De Vries Francis","Elliot Callan","Garbett Matthew","Just Elijah","McCowatt Callum","Old Ben","Paulsen Alex","Payne Tim","Pijnaker Nando","Randall Jesse","Rufer Alex","Singh Sarpreet","Stamenic Marko","Surman Finn","Thomas Ryan","Waine Ben","Wood Chris","Woud Michael"],
  "Norway":["Alexander Sørloth","Andreas Schjelderup","Antonio Nusa","David Møller Wolfe","Egil Selvik","Erling Haaland","Fredrik André Bjørkan","Fredrik Aursnes","Henrik Falchener","Jens Petter Hauge","Julian Ryerson","Jørgen Strand Larsen","Kristian Thorstvedt","Kristoffer Ajer","Leo Østigård","Marcus Holmgren Pedersen","Martin Ødegaard","Morten Thorsby","Oscar Bobb","Patrick Berg","Sander Berge","Sander Tangvik","Sondre Langås","Thelo Aasgaard","Torbjørn Heggem","Ørjan Nyland"],
  "Panama":["Adalberto Carrasquilla","Alberto Quintero","Andrés Andrade","Aníbal Godoy","Azarias Londoño","Carlos Harvey","Cecilio Waterman","Cristian Martínez","César Blackman","César Samudio","César Yanis","Edgardo Fariña","Eric Davis","Fidel Escobar","Ismael Díaz","Jiovany Ramos","Jorge Gutiérrez","José Córdoba","José Fajardo","José Luis Rodríguez","Luis Mejía","Michael Amir Murillo","Orlando Mosquera","Roderick Miller","Tomás Rodríguez","Yoel Bárcenas"],
  "Paraguay":["Alexandro Maidana","Andrés Cubas","Antonio Sanabria","Braian Ojeda","Damián Bobadilla","Diego Gómez","Fabián Balbuena","Gabriel Ávalos","Gastón Olveira","Gatito Fernández","Gustavo Caballero","Gustavo Gómez","Gustavo Velázquez","Isidro Pitta","José Canale","Juan José Cáceres","Julio Enciso","Júnior Alonso","Kaku","Matías Galarza","Maurício","Miguel Almirón","Omar Alderete","Orlando Gill","Ramón Sosa","Álex Arce"],
  "Portugal":["Bernardo Silva","Bruno Fernandes","Cristiano Ronaldo","Diogo Costa","Diogo Dalot","Francisco Conceição","Francisco Trincão","Gonçalo Guedes","Gonçalo Inácio","Gonçalo Ramos","José Sá","João Cancelo","João Félix","João Neves","Matheus Nunes","Nuno Mendes","Nélson Semedo","Pedro Neto","Rafael Leão","Renato Veiga","Rui Silva","Rúben Dias","Rúben Neves","Samú Costa","Tomás Araújo","Vitinha"],
  "Qatar":["Abdulaziz Hatem","Ahmed Al-Ganehi","Ahmed Alaaeldin","Ahmed Fathy","Akram Afif","Al-Hashmi Al-Hussain","Almoez Ali","Assim Madibo","Ayoub Al-Oui","Boualem Khoukhi","Edmilson Junior","Hassan Al-Haydos","Homam Ahmed","Issa Laye","Jassem Gaber","Karim Boudiaf","Lucas Mendes","Mahmud Abunada","Meshaal Barsham","Mohamed Manai","Mohammed Muntari","Pedro Miguel","Salah Zakaria","Sultan Al-Brake","Tahsin Jamshid","Yusuf Abdurisag"],
  "Saudi Arabia":["Abdulelah Al-Amri","Abdullah Al-Hamdan","Abdullah Al-Khaibari","Ahmed Al-Kassar","Alaa Al-Hejji","Ali Lajami","Ali Majrashi","Ayman Yahya","Firas Al-Buraikan","Hassan Al-Tambakti","Hassan Kadesh","Jehad Thakri","Khalid Al-Ghannam","Mohamed Kanno","Mohammed Abu Al-Shamat","Mohammed Al-Owais","Moteb Al-Harbi","Musab Al-Juwayr","Nasser Al-Dawsari","Nawaf Al-Aqidi","Nawaf Boushal","Saleh Al-Shehri","Salem Al-Dawsari","Saud Abdulhamid","Sultan Mandash","Ziyad Al-Johani"],
  "Scotland":["Aaron Hickey","Andy Robertson","Angus Gunn","Anthony Ralston","Ben Gannon-Doak","Ché Adams","Craig Gordon","Dominic Hyam","Findlay Curtis","George Hirst","Grant Hanley","Jack Hendry","John McGinn","John Souttar","Kenny McLean","Kieran Tierney","Lawrence Shankland","Lewis Ferguson","Liam Kelly","Lyndon Dykes","Nathan Patterson","Ross Stewart","Ryan Christie","Scott McKenna","Scott McTominay","Tyler Fletcher"],
  "Senegal":["Abdoulaye Seck","Antoine Mendy","Assane Diao","Bamba Dieng","Bara Sapoko Ndiaye","Cherif Ndiaye","El Hadji Malick Diouf","Habib Diarra","Ibrahim Mbaye","Idrissa Gueye","Iliman Ndiaye","Ismail Jakobs","Ismaïla Sarr","Kalidou Koulibaly","Krépin Diatta","Lamine Camara","Mamadou Sarr","Mory Diaw","Moussa Niakhaté","Nicolas Jackson","Pape Gueye","Pape Matar Sarr","Pathé Ciss","Sadio Mané","Yehvann Diouf","Édouard Mendy"],
  "South Africa":["Aubrey Modiba","Bradley Cross","Evidence Makgopa","Ime Okon","Iqraam Rayners","Jayden Adams","Kamogelo Sebelebele","Khuliso Mudau","Khulumani Ndamane","Lyle Foster","Mbekezeli Mbokazi","Nkosinathi Sibisi","Olwethu Makhanya","Oswin Appollis","Relebohile Mofokeng","Ricardo Goss","Ronwen Williams","Samukele Kabini","Sipho Chaine","Sphephelo Sithole","Teboho Mokoena","Thabang Matuludi","Thalente Mbatha","Thapelo Maseko","Themba Zwane","Tshepang Moremi"],
  "South Korea":["Bae Jun-ho","Cho Gue-sung","Cho Wi-je","Eom Ji-sung","Hwang Hee-chan","Hwang In-beom","Jens Castrop","Jo Hyeon-woo","Kim Jin-gyu","Kim Min-jae","Kim Moon-hwan","Kim Seung-gyu","Kim Tae-hyeon","Lee Dong-gyeong","Lee Gi-hyuk","Lee Han-beom","Lee Jae-sung","Lee Kang-in","Lee Tae-seok","Oh Hyeon-gyu","Paik Seung-ho","Park Jin-seob","Seol Young-woo","Son Heung-min","Song Bum-keun","Yang Hyun-jun"],
  "Spain":["Aymeric Laporte","Borja Iglesias","Dani Olmo","David Raya","Eric García","Fabián Ruiz","Ferran Torres","Gavi","Joan Garcia","Lamine Yamal","Marc Cucurella","Marc Pubill","Marcos Llorente","Martín Zubimendi","Mikel Merino","Mikel Oyarzabal","Nico Williams","Pau Cubarsí","Pedri","Pedro Porro","Rodri","Unai Simón","Víctor Muñoz","Yéremy Pino","Álex Baena","Álex Grimaldo"],
  "Sweden":["Alexander Bernhardsson","Alexander Isak","Anthony Elanga","Benjamin Nygren","Besfort Zeneli","Carl Starfelt","Daniel Svensson","Elliot Stroud","Eric Smith","Gabriel Gudmundsson","Gustaf Lagerbielke","Gustaf Nilsson","Herman Johansson","Hjalmar Ekdal","Isak Hien","Jacob Widell Zetterström","Jesper Karlström","Ken Sema","Kristoffer Nordfeldt","Lucas Bergvall","Mattias Svanberg","Taha Ali","Victor Lindelöf","Viktor Gyökeres","Viktor Johansson","Yasin Ayari"],
  "Switzerland":["Ardon Jashari","Aurèle Amenda","Breel Embolo","Cedric Itten","Christian Fassnacht","Dan Ndoye","Denis Zakaria","Djibril Sow","Eray Cömert","Fabian Rieder","Granit Xhaka","Gregor Kobel","Johan Manzambi","Luca Jaquez","Manuel Akanji","Marvin Keller","Michel Aebischer","Miro Muheim","Nico Elvedi","Noah Okafor","Remo Freuler","Ricardo Rodriguez","Rubén Vargas","Silvan Widmer","Yvon Mvogo","Zeki Amdouni"],
  "Tunisia":["Adem Arous","Ali Abdi","Anis Ben Slimane","Aymen Dahmen","Dylan Bronn","Elias Achouri","Elias Saad","Ellyes Skhiri","Firas Chaouat","Hadj Mahmoud","Hannibal Mejbri","Hazem Mastouri","Ismaël Gharbi","Khalil Ayari","Mohamed Amine Ben Hamida","Montassar Talbi","Mortadha Ben Ouanes","Mouhib Chamakh","Moutaz Neffati","Omar Rekik","Raed Chikhaoui","Rani Khedira","Rayan Elloumi","Sebastian Tounekti","Yan Valery"],
  "Turkiye":["Abdülkerim Bardakcı","Altay Bayındır","Arda Güler","Barış Alper Yılmaz","Can Uzun","Deniz Gül","Eren Elmalı","Ferdi Kadıoğlu","Hakan Çalhanoğlu","Kaan Ayhan","Kenan Yıldız","Kerem Aktürkoğlu","Merih Demiral","Mert Günok","Mert Müldür","Orkun Kökçü","Ozan Kabak","Oğuz Aydın","Salih Özcan","Samet Akaydin","Uğurcan Çakır","Yunus Akgün","Zeki Çelik","Çağlar Söyüncü","İrfan Can Kahveci","İsmail Yüksek"],
  "United States":["Alejandro Zendejas","Alex Freeman","Antonee Robinson","Auston Trusty","Brenden Aaronson","Chris Brady","Chris Richards","Christian Pulisic","Cristian Roldan","Folarin Balogun","Giovanni Reyna","Haji Wright","Joe Scally","Malik Tillman","Mark McKenzie","Matt Freese","Matt Turner","Maximilian Arfsten","Miles Robinson","Ricardo Pepi","Sebastian Berhalter","Sergiño Dest","Tim Ream","Timothy Weah","Tyler Adams","Weston McKennie"],
  "Uruguay":["Agustín Canobbio","Brian Rodríguez","Darwin Núñez","Emiliano Martínez","Facundo Pellistri","Federico Valverde","Federico Viñas","Fernando Muslera","Giorgian de Arrascaeta","Guillermo Varela","Joaquín Piquerez","José Giménez","Juan Manuel Sanabria","Manuel Ugarte","Mathías Olivera","Matías Viña","Maximiliano Araújo","Nicolás de la Cruz","Rodrigo Aguirre","Rodrigo Bentancur","Rodrigo Zalazar","Ronald Araújo","Santiago Bueno","Santiago Mele","Sebastián Cáceres","Sergio Rochet"],
  "Uzbekistan":["Abbosbek Fayzullaev","Abdukodir Khusanov","Abdulla Abdullaev","Abduvohid Nematov","Akmal Mozgovoy","Avazbek Ulmasaliev","Azizbek Amonov","Azizjon Ganiev","Bekhruz Karimov","Botirali Ergashev","Dostonbek Khamdamov","Eldor Shomurodov","Farrukh Sayfiev","Igor Sergeev","Jakhongir Urozov","Jaloliddin Masharipov","Jamshid Iskanderov","Khojiakbar Alijonov","Odiljon Hamrobekov","Oston Urunov","Otabek Shukurov","Rustam Ashurmatov","Sherzod Esanov","Sherzod Nasrullaev","Umar Eshmurodov","Utkir Yusupov"],
};

const getFallbackPlayers = (oppName) => {
  const pool = OPP_PLAYERS_2026[oppName] || ["Keeper","Defender","Midfielder","Attacker","Striker","Forward","Winger","Fullback","Stopper","Creator","Finisher"];
  return pool.map(n=>({name:n}));
};

const DIFFICULTIES = {
  "Amateur":    {respins:5, chaos:8,  oppMod:-6, desc:"Weaker opponents · plenty of respins to help build your squad"},
  "Pro":        {respins:3, chaos:12, oppMod:-3, desc:"Balanced challenge · limited respins to keep it interesting"},
  "World Class":{respins:1, chaos:15, oppMod:0,  desc:"Tough opponents · one respin — make it count"},
  "Legendary":  {respins:0, chaos:20, oppMod:+5, desc:"Elite difficulty · no respins · pure luck of the draw"},
};

const KO_POOLS=[
  [{name:"Scotland",rating:74,flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿"},{name:"Haiti",rating:63,flag:"🇭🇹"},{name:"Qatar",rating:70,flag:"🇶🇦"},{name:"Curacao",rating:62,flag:"🇨🇼"},{name:"Ecuador",rating:75,flag:"🇪🇨"},{name:"Tunisia",rating:72,flag:"🇹🇳"},{name:"New Zealand",rating:65,flag:"🇳🇿"},{name:"Cape Verde",rating:69,flag:"🇨🇻"},{name:"Iraq",rating:68,flag:"🇮🇶"},{name:"Jordan",rating:67,flag:"🇯🇴"},{name:"DR Congo",rating:70,flag:"🇨🇩"},{name:"Panama",rating:67,flag:"🇵🇦"},{name:"Canada",rating:76,flag:"🇨🇦"},{name:"South Africa",rating:72,flag:"🇿🇦"},{name:"Bosnia-Herz.",rating:74,flag:"🇧🇦"},{name:"Uzbekistan",rating:68,flag:"🇺🇿"}],
  [{name:"Mexico",rating:80,flag:"🇲🇽"},{name:"Switzerland",rating:81,flag:"🇨🇭"},{name:"Morocco",rating:80,flag:"🇲🇦"},{name:"Senegal",rating:79,flag:"🇸🇳"},{name:"Norway",rating:77,flag:"🇳🇴"},{name:"Austria",rating:78,flag:"🇦🇹"},{name:"Japan",rating:78,flag:"🇯🇵"},{name:"South Korea",rating:78,flag:"🇰🇷"},{name:"Ivory Coast",rating:76,flag:"🇨🇮"},{name:"Australia",rating:74,flag:"🇦🇺"},{name:"Algeria",rating:74,flag:"🇩🇿"},{name:"Paraguay",rating:75,flag:"🇵🇾"},{name:"Uruguay",rating:82,flag:"🇺🇾"},{name:"Ghana",rating:72,flag:"🇬🇭"},{name:"Czechia",rating:76,flag:"🇨🇿"},{name:"Turkiye",rating:77,flag:"🇹🇷"}],
  [{name:"Netherlands",rating:82,flag:"🇳🇱"},{name:"Belgium",rating:82,flag:"🇧🇪"},{name:"Colombia",rating:82,flag:"🇨🇴"},{name:"Portugal",rating:86,flag:"🇵🇹"},{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},{name:"Croatia",rating:80,flag:"🇭🇷"},{name:"USA",rating:79,flag:"🇺🇸"},{name:"Denmark",rating:79,flag:"🇩🇰"}],
  [{name:"Germany",rating:84,flag:"🇩🇪"},{name:"Spain",rating:86,flag:"🇪🇸"},{name:"Brazil",rating:85,flag:"🇧🇷"},{name:"France",rating:87,flag:"🇫🇷"},{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},{name:"Portugal",rating:86,flag:"🇵🇹"}],
  [{name:"Argentina",rating:86,flag:"🇦🇷"},{name:"France",rating:87,flag:"🇫🇷"},{name:"Spain",rating:86,flag:"🇪🇸"},{name:"Brazil",rating:85,flag:"🇧🇷"},{name:"Germany",rating:84,flag:"🇩🇪"},{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"}],
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const avgRating=sq=>{const f=sq.filter(s=>s.player);return f.length?Math.round(f.reduce((a,s)=>a+s.player.rating,0)/f.length):70;};
const ATK_POS_SET=new Set(["ST","LW","RW","CAM","LM","RM","CM"]);
const DEF_POS_SET=new Set(["GK","CB","LB","RB","LWB","RWB","CDM","CM"]);
const atkRating=sq=>{const f=sq.filter(s=>s.player&&s.player.pos.some(p=>ATK_POS_SET.has(p)));return f.length?Math.round(f.reduce((a,s)=>a+s.player.rating,0)/f.length):70;};
const defRating=sq=>{const f=sq.filter(s=>s.player&&s.player.pos.some(p=>DEF_POS_SET.has(p)));return f.length?Math.round(f.reduce((a,s)=>a+s.player.rating,0)/f.length):70;};
const pickRandom=arr=>arr[Math.floor(Math.random()*arr.length)];
const rng=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

const simMatch=(myAtk,myDef,oppAtk,oppDef,chaos)=>{
  const g=bias=>Math.max(0,Math.round(Math.random()*2.2+bias));
  const swA=(Math.random()*chaos*2)-chaos;
  const effA=(myAtk-oppDef)+swA;
  const myGoals=effA>12?g(1.1):effA>5?g(0.5):effA>-5?g(0.1):effA>-12?g(0):g(-0.4);
  const swB=(Math.random()*chaos*2)-chaos;
  const effB=(oppAtk-myDef)+swB;
  const oppGoals=effB>12?g(1.1):effB>5?g(0.5):effB>-5?g(0.1):effB>-12?g(0):g(-0.4);
  return{myGoals,oppGoals};
};

const buildEvents=(myG,opG,mySquad,oppName)=>{
  const oppPlayers=getFallbackPlayers(oppName);
  const attackers=mySquad.filter(s=>s.player&&["ST","LW","RW","CAM","LM","RM"].some(p=>s.player.pos.includes(p)));
  const mids=mySquad.filter(s=>s.player&&["CM","CDM","CAM","LM","RM","LWB","RWB"].some(p=>s.player.pos.includes(p)));
  const all=mySquad.filter(s=>s.player);
  const usedMins=new Set();
  const getMin=()=>{let m;do{m=rng(1,90);}while(usedMins.has(m));usedMins.add(m);return m;};

  // Step 1: assign minutes to all events upfront, then sort chronologically
  // to enforce that red cards block subsequent goals/assists by that player.
  const rawEvents=[];

  // Cards first — assign random minutes
  let usRedName=null;let themRedName=null;let usRedMin=999;let themRedMin=999;
  if(Math.random()<0.5&&all.length){rawEvents.push({type:"yellow",team:"us",name:pickRandom(all).player.name,min:getMin()});}
  if(Math.random()<0.4&&oppPlayers.length){rawEvents.push({type:"yellow",team:"them",name:pickRandom(oppPlayers).name,min:getMin()});}
  if(Math.random()<0.08){
    const redTeam=Math.random()>.5?"us":"them";
    const redName=redTeam==="us"&&all.length?pickRandom(all).player.name:pickRandom(oppPlayers).name;
    const redMin=getMin();
    rawEvents.push({type:"red",team:redTeam,name:redName,min:redMin});
    if(redTeam==="us"){usRedName=redName;usRedMin=redMin;}
    else{themRedName=redName;themRedMin=redMin;}
  }

  // Bug fix #2: red card disadvantages the penalised team's goal count.
  // The earlier the red card, the bigger the impact. A red card significantly
  // reduces the chance of scoring and boosts the opponent's.
  let adjMyG=myG;let adjOpG=opG;
  if(usRedName&&usRedMin<999){
    // Minutes remaining after red card — more time = more disadvantage
    const minsWithTen=90-usRedMin;
    // High chance of losing a goal (or not scoring one) when playing with 10 men
    if(minsWithTen>45&&Math.random()<0.7){adjMyG=Math.max(0,adjMyG-1);adjOpG=Math.min(adjOpG+(Math.random()<0.5?1:0),adjOpG+1);}
    else if(minsWithTen>20&&Math.random()<0.5){adjMyG=Math.max(0,adjMyG-rng(0,1));if(Math.random()<0.35)adjOpG=adjOpG+1;}
    else if(Math.random()<0.25){adjMyG=Math.max(0,adjMyG-1);}
  }
  if(themRedName&&themRedMin<999){
    const minsWithTen=90-themRedMin;
    // Opponent down to 10 — user gets an attacking boost
    if(minsWithTen>45&&Math.random()<0.6){adjMyG=adjMyG+(Math.random()<0.5?1:0);adjOpG=Math.max(0,adjOpG-rng(0,1));}
    else if(minsWithTen>20&&Math.random()<0.4){adjMyG=adjMyG+(Math.random()<0.3?1:0);}
  }

  // Goals — assign minutes and ensure scorer/assister aren't red-carded before this minute
  for(let i=0;i<adjMyG;i++){
    const min=getMin();
    // available scorers: not the player who got red before this minute
    const availScorers=attackers.length
      ?attackers.filter(s=>!(s.player.name===usRedName&&usRedMin<min))
      :all.filter(s=>!(s.player.name===usRedName&&usRedMin<min));
    const scorerPool=availScorers.length?availScorers:(attackers.length?attackers:all);
    const sc=pickRandom(scorerPool);
    const availAssist=(mids.length?mids:all).filter(p=>p!==sc&&!(p.player.name===usRedName&&usRedMin<min));
    const as=availAssist.length?pickRandom(availAssist):null;
    rawEvents.push({type:"goal",team:"us",name:sc?.player?.name||"Player",assist:as?.player?.name||null,min});
  }
  for(let i=0;i<adjOpG;i++){
    const min=getMin();
    const availScorers=oppPlayers.filter(p=>!(p.name===themRedName&&themRedMin<min));
    const sc=availScorers.length?pickRandom(availScorers):pickRandom(oppPlayers);
    const availAssist=oppPlayers.filter(p=>p.name!==sc.name&&!(p.name===themRedName&&themRedMin<min));
    const as=availAssist.length?pickRandom(availAssist):null;
    rawEvents.push({type:"goal",team:"them",name:sc.name,assist:as?.name||null,min});
  }

  return{events:rawEvents.sort((a,b)=>a.min-b.min),myG:adjMyG,opG:adjOpG};
};

const simGroup=(teams,chaos)=>{
  const st={};
  teams.forEach(t=>{st[t.name]={...t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});
  for(let a=0;a<teams.length;a++)for(let b=a+1;b<teams.length;b++){
    const rA=teams[a].rating;const rB=teams[b].rating;
    const r=simMatch(rA,rA,rB,rB,chaos);
    const[ta,tb]=[st[teams[a].name],st[teams[b].name]];
    ta.p++;tb.p++;ta.gf+=r.myGoals;ta.ga+=r.oppGoals;tb.gf+=r.oppGoals;tb.ga+=r.myGoals;
    if(r.myGoals>r.oppGoals){ta.w++;ta.pts+=3;tb.l++;}
    else if(r.myGoals===r.oppGoals){ta.d++;ta.pts+=1;tb.d++;tb.pts+=1;}
    else{tb.w++;tb.pts+=3;ta.l++;}
  }
  return Object.values(st).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
};

// Compute standings from pre-seeded match results (both user and non-user).
// oppFixtures: [{a: teamName, b: teamName, ag: goals, bg: goals}] — all non-user matches for the group
// userResults: [{myGoals, oppGoals, opp}] — user's matches played so far
// matchday: which matchday we're displaying (1,2,3) — only include fixtures from that matchday and before
const computeStandings=(userResults,userTeam,groupTeams,oppFixtures,matchday)=>{
  const st={};
  groupTeams.forEach(t=>{st[t.name]={...t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,isUser:t.name===userTeam.name};});
  // Apply user results (matchday 1=result[0], matchday 2=result[1], matchday 3=result[2])
  userResults.forEach((r,i)=>{
    if(i+1>matchday)return; // only up to this matchday
    const opp=r.opp;
    const[tu,to]=[st[userTeam.name],st[opp.name]];
    tu.p++;to.p++;tu.gf+=r.myGoals;tu.ga+=r.oppGoals;to.gf+=r.oppGoals;to.ga+=r.myGoals;
    if(r.myGoals>r.oppGoals){tu.w++;tu.pts+=3;to.l++;}
    else if(r.myGoals===r.oppGoals){tu.d++;tu.pts+=1;to.d++;to.pts+=1;}
    else{to.w++;to.pts+=3;tu.l++;}
  });
  // Apply non-user fixtures up to this matchday
  (oppFixtures||[]).forEach(f=>{
    if(f.matchday>matchday)return;
    const[ta,tb]=[st[f.a],st[f.b]];
    if(!ta||!tb)return;
    ta.p++;tb.p++;ta.gf+=f.ag;ta.ga+=f.bg;tb.gf+=f.bg;tb.ga+=f.ag;
    if(f.ag>f.bg){ta.w++;ta.pts+=3;tb.l++;}
    else if(f.ag===f.bg){ta.d++;ta.pts+=1;tb.d++;tb.pts+=1;}
    else{tb.w++;tb.pts+=3;ta.l++;}
  });
  return Object.values(st).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
};

// Seed all non-user fixtures for a group once at tournament start.
// 4-team group [user=U, A=opps[0], B=opps[1], C=opps[2]]:
//   Matchday 1: U vs A,  B vs C
//   Matchday 2: U vs B,  A vs C
//   Matchday 3: U vs C,  A vs B
const seedOppFixtures=(opps,chaos)=>{
  const pairs=[{a:opps[0].name,b:opps[1].name,rA:opps[0].rating,rB:opps[1].rating,matchday:1},
               {a:opps[0].name,b:opps[2].name,rA:opps[0].rating,rB:opps[2].rating,matchday:2},
               {a:opps[1].name,b:opps[2].name,rA:opps[1].rating,rB:opps[2].rating,matchday:3}];
  // Wait: MD1: U-A + B-C; MD2: U-B + A-C; MD3: U-C + A-B
  // So: pair (B,C) = matchday 1; pair (A,C) = matchday 2; pair (A,B) = matchday 3
  const fixtures=[
    {a:opps[1].name,b:opps[2].name,rA:opps[1].rating,rB:opps[2].rating,matchday:1},
    {a:opps[0].name,b:opps[2].name,rA:opps[0].rating,rB:opps[2].rating,matchday:2},
    {a:opps[0].name,b:opps[1].name,rA:opps[0].rating,rB:opps[1].rating,matchday:3},
  ];
  return fixtures.map(f=>{
    const r=simMatch(f.rA,f.rA,f.rB,f.rB,chaos);
    return{a:f.a,b:f.b,ag:r.myGoals,bg:r.oppGoals,matchday:f.matchday};
  });
};

// ── Formation Pitch ───────────────────────────────────────────────────────────
const ROW_BOT={0:88,1:68,2:50,3:30,4:12};
const Pitch=({formation,slots,activeIdx,onSlot,clickable=true})=>{
  const layout=FORMATION_LAYOUT[formation]||[];
  return(
    <div style={{position:"relative",width:"100%",maxWidth:360,margin:"0 auto",aspectRatio:"0.65",background:"linear-gradient(180deg,#0d1a12 0%,#111f16 40%,#0d1a12 100%)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:6,overflow:"hidden"}}>
      {/* Pitch stripe effect */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 22px,rgba(255,255,255,0.018) 22px,rgba(255,255,255,0.018) 44px)",pointerEvents:"none"}}/>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.2}} viewBox="0 0 100 154">
        <rect x="7" y="4" width="86" height="146" fill="none" stroke="white" strokeWidth="0.8"/>
        <circle cx="50" cy="77" r="13" fill="none" stroke="white" strokeWidth=".7"/>
        <line x1="7" y1="77" x2="93" y2="77" stroke="white" strokeWidth=".4"/>
        <rect x="23" y="4" width="54" height="19" fill="none" stroke="white" strokeWidth=".6"/>
        <rect x="23" y="131" width="54" height="19" fill="none" stroke="white" strokeWidth=".6"/>
        <circle cx="50" cy="77" r="1.2" fill="white" opacity=".4"/>
      </svg>
      {layout.map((item,i)=>{
        const s=slots[i];const filled=!!s?.player;const active=activeIdx===i;
        const isLegend=filled&&s.player.rating>=90;
        const dotColor=isLegend?"#f5a623":filled?"#6ee7b7":"rgba(255,255,255,0.25)";
        const borderColor=active?"#f5a623":isLegend?"#f5a623":filled?"rgba(110,231,183,0.7)":"rgba(255,255,255,0.2)";
        const bgColor=active?"rgba(245,166,35,0.25)":isLegend?"rgba(245,166,35,0.15)":filled?"rgba(110,231,183,0.12)":"rgba(255,255,255,0.05)";
        return(
          <div key={i} onClick={()=>clickable&&onSlot&&onSlot(i)} style={{position:"absolute",left:`${item.c*100}%`,bottom:`${ROW_BOT[item.r]}%`,transform:"translate(-50%,50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:clickable?"pointer":"default",zIndex:active?10:1}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:bgColor,border:`2px solid ${borderColor}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:active?"0 0 12px rgba(245,166,35,.5)":(isLegend?"0 0 8px rgba(245,166,35,.3)":"none"),transition:"all .18s"}}>
              {filled
                ?<span style={{fontSize:"0.52rem",lineHeight:1.15,textAlign:"center",color:isLegend?"#f5a623":"#e0fdf4",fontWeight:700,padding:"1px",fontFamily:"'Saira Condensed',sans-serif",letterSpacing:"0.3px"}}>{s.player.name.split(" ").pop().substring(0,9)}</span>
                :<span style={{fontSize:"0.65rem",color:active?"#f5a623":"rgba(255,255,255,.4)",fontWeight:700,fontFamily:"'Saira Condensed',sans-serif",letterSpacing:"0.5px"}}>{item.pos}</span>}
            </div>
            {filled&&<div style={{fontSize:"0.72rem",color:isLegend?"#f5a623":"#6ee7b7",fontWeight:700,background:"rgba(0,0,0,.85)",padding:"2px 5px",borderRadius:2,fontFamily:"'Teko',sans-serif",letterSpacing:"0.5px",lineHeight:1.2}}>{s.player.rating}</div>}
          </div>
        );
      })}
    </div>
  );
};

// Flag abbreviations — reliable fallback when emoji flags don't render
const FLAG_ABBR={"Brazil":"BR","Morocco":"MA","Haiti":"HT","Scotland":"SCO","Mexico":"MX","South Korea":"KOR","South Africa":"RSA","Czechia":"CZE","Canada":"CAN","Switzerland":"SUI","Qatar":"QAT","Bosnia-Herz.":"BIH","United States":"USA","Paraguay":"PAR","Australia":"AUS","Turkiye":"TUR","Germany":"GER","Curacao":"CUR","Ivory Coast":"CIV","Ecuador":"ECU","Netherlands":"NED","Japan":"JPN","Sweden":"SWE","Tunisia":"TUN","Belgium":"BEL","Egypt":"EGY","Iran":"IRN","New Zealand":"NZL","Spain":"ESP","Cape Verde":"CPV","Saudi Arabia":"KSA","Uruguay":"URU","France":"FRA","Senegal":"SEN","Iraq":"IRQ","Norway":"NOR","Argentina":"ARG","Algeria":"ALG","Austria":"AUT","Jordan":"JOR","Portugal":"POR","DR Congo":"COD","Uzbekistan":"UZB","Colombia":"COL","England":"ENG","Croatia":"CRO","Ghana":"GHA","Panama":"PAN","Nigeria":"NGA","Cameroon":"CMR","Denmark":"DEN","YOUR TEAM":"YOU"};
const FlagBadge=({name})=>{
  const abbr=FLAG_ABBR[name]||name?.substring(0,3).toUpperCase()||"???";
  const isUser=name==="YOUR TEAM";
  return(
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:18,fontSize:"0.46rem",fontWeight:700,letterSpacing:"0.5px",background:isUser?"rgba(245,166,35,0.15)":"rgba(255,255,255,0.06)",color:isUser?"#f5a623":"#94a3b8",borderRadius:3,marginRight:6,flexShrink:0,fontFamily:"'Saira Condensed',sans-serif",border:`1px solid ${isUser?"rgba(245,166,35,0.35)":"rgba(255,255,255,0.1)"}`}}>
      {isUser?"★":abbr}
    </span>
  );
};

// ── Group Table ───────────────────────────────────────────────────────────────
const GTable=({standings})=>(
  <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Saira Condensed',sans-serif"}}>
    <thead><tr style={{color:"#475569",fontSize:"0.62rem",letterSpacing:"1.5px",textTransform:"uppercase"}}>
      {["","TEAM","P","W","D","L","GD","PTS"].map((h,i)=>(
        <th key={i} style={{textAlign:i<=1?"left":"center",padding:"5px 4px",borderBottom:"1px solid rgba(255,255,255,0.07)",fontWeight:600}}>{h}</th>
      ))}
    </tr></thead>
    <tbody>{standings.map((t,i)=>{
      const q=i<2;
      const gd=t.gf-t.ga;
      return(
        <tr key={t.name} style={{background:t.isUser?"rgba(245,166,35,0.07)":"transparent",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
          <td style={{padding:"5px 4px",textAlign:"center"}}>
            <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:q?"#f5a623":"rgba(255,255,255,0.12)",boxShadow:q?"0 0 5px rgba(245,166,35,0.5)":"none"}}/>
          </td>
          <td style={{padding:"5px 4px",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            <span style={{display:"inline-flex",alignItems:"center"}}>
              <FlagBadge name={t.name}/>
              <span style={{fontWeight:t.isUser?700:400,color:t.isUser?"#f5a623":"#cbd5e1",fontSize:"0.78rem"}}>{t.name}</span>
            </span>
          </td>
          {[t.p,t.w,t.d,t.l].map((v,j)=><td key={j} style={{textAlign:"center",padding:"5px 3px",color:"#475569",fontSize:"0.76rem"}}>{v}</td>)}
          <td style={{textAlign:"center",padding:"5px 3px",color:gd>0?"#6ee7b7":gd<0?"#f87171":"#475569",fontWeight:gd!==0?600:400,fontSize:"0.76rem"}}>{gd>0?"+":""}{gd}</td>
          <td style={{textAlign:"center",padding:"5px 3px",fontWeight:700,color:t.isUser?"#f5a623":"#f1f5f9",fontSize:"0.95rem",fontFamily:"'Teko',sans-serif",letterSpacing:"0.5px"}}>{t.pts}</td>
        </tr>
      );
    })}</tbody>
  </table>
);

// ── Match Sim ─────────────────────────────────────────────────────────────────
// simPenalties: returns {myScore, oppScore} using realistic FIFA shootout rules.
// Each team takes up to 5 kicks (~75% conversion). If still level, sudden death.
// We also early-terminate if the result is already mathematically decided.
const simPenalties=()=>{
  let myS=0;let oppS=0;
  const myKicks=[];const oppKicks=[];
  for(let i=0;i<5;i++){
    const mk=Math.random()<0.75;const ok=Math.random()<0.75;
    myKicks.push(mk);oppKicks.push(ok);
    if(mk)myS++;if(ok)oppS++;
    // Early termination: if one side can't catch up with remaining kicks
    const rem=4-i;
    if(myS>oppS+rem||oppS>myS+rem)break;
  }
  if(myS===oppS){
    // Sudden death — keep going until someone misses and other scores
    for(let sd=0;sd<10;sd++){
      const mk=Math.random()<0.75;const ok=Math.random()<0.75;
      if(mk)myS++;if(ok)oppS++;
      if(myS!==oppS)break;
    }
  }
  return{myScore:myS,oppScore:oppS};
};

const MatchSim=({myG,opG,events,opp,onComplete,isKO})=>{
  const [shown,setShown]=useState([]);
  const [clock,setClock]=useState(0);
  const [simPhase,setSimPhase]=useState("regulation");
  const [penResult,setPenResult]=useState(null);
  const evRef=useRef(events);
  const isDraw=myG===opG;

  useEffect(()=>{
    if(simPhase!=="regulation")return;
    const iv=setInterval(()=>setClock(p=>{
      const n=p+0.9;
      if(n>=90){
        clearInterval(iv);
        if(isKO&&isDraw){
          const pr=simPenalties();
          setPenResult(pr);
          setSimPhase("pens");
        } else {
          setSimPhase("done");
        }
        return 90;
      }
      return n;
    }),170);
    return()=>clearInterval(iv);
  },[simPhase]);

  useEffect(()=>{
    if(simPhase!=="regulation")return;
    const due=evRef.current.filter(e=>e.min<=clock&&!shown.includes(e));
    if(due.length)setShown(p=>[...p,...due]);
  },[clock,simPhase]);

  const regScoreUs=shown.filter(e=>e.type==="goal"&&e.team==="us").length;
  const regScoreThem=shown.filter(e=>e.type==="goal"&&e.team==="them").length;
  const myWonPens=penResult&&penResult.myScore>penResult.oppScore;
  const isLive=simPhase==="regulation";
  const usWin=regScoreUs>regScoreThem;
  const themWin=regScoreThem>regScoreUs;

  return(
    <div>
      {/* Stadium Scoreboard */}
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"18px 14px",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)",pointerEvents:"none",opacity:0.5}}/>
        {/* Status */}
        <div style={{textAlign:"center",marginBottom:10,position:"relative"}}>
          <span style={{fontFamily:"'Teko',sans-serif",fontSize:"0.88rem",letterSpacing:"4px",color:isLive?"#ef4444":simPhase==="pens"?"#f5a623":"#6ee7b7",textTransform:"uppercase"}}>
            {isLive&&<span style={{animation:"pulse 1s infinite",display:"inline-block",marginRight:6,fontSize:"0.7rem"}}>●</span>}
            {isLive?`${Math.floor(clock)}'  LIVE`:""}
            {simPhase==="pens"?"PENALTY SHOOTOUT":""}
            {simPhase==="done"?"FULL TIME":""}
          </span>
        </div>
        {/* Score */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,position:"relative"}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"0.65rem",fontWeight:500,letterSpacing:"2px",color:"#f5a623",marginBottom:4,textTransform:"uppercase"}}>YOUR SQUAD</div>
            <div style={{fontFamily:"'Teko',sans-serif",fontSize:"5.5rem",lineHeight:0.9,fontWeight:400,color:usWin?"#6ee7b7":themWin?"#64748b":"#f1f5f9",textShadow:usWin?"0 0 24px rgba(110,231,183,0.35)":"none",letterSpacing:"-2px"}}>{regScoreUs}</div>
          </div>
          <div style={{fontFamily:"'Teko',sans-serif",fontSize:"2rem",color:"#475569",fontWeight:300,letterSpacing:"2px",paddingBottom:8}}>—</div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"0.65rem",fontWeight:500,letterSpacing:"2px",color:"#94a3b8",marginBottom:4,textTransform:"uppercase",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{opp.name}</div>
            <div style={{fontFamily:"'Teko',sans-serif",fontSize:"5.5rem",lineHeight:0.9,fontWeight:400,color:themWin?"#f87171":usWin?"#334155":"#f1f5f9",textShadow:themWin?"0 0 24px rgba(248,113,113,0.35)":"none",letterSpacing:"-2px"}}>{regScoreThem}</div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:6}}>
          <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.65rem",color:"#64748b",letterSpacing:"2px"}}>{opp.rating} OVR</span>
        </div>
      </div>

      {/* Event feed */}
      <div style={{marginBottom:12,display:"flex",flexDirection:"column",gap:3}}>
        {shown.map((e,i)=>{
          const isUs=e.team==="us";
          const isGoal=e.type==="goal";
          return(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:isGoal?(isUs?"rgba(110,231,183,0.06)":"rgba(248,113,113,0.06)"):"rgba(255,255,255,0.02)",border:`1px solid ${isGoal?(isUs?"rgba(110,231,183,0.18)":"rgba(248,113,113,0.18)"):"rgba(255,255,255,0.05)"}`,borderRadius:4,animation:"slideIn .3s ease",borderLeft:`3px solid ${isGoal?(isUs?"#6ee7b7":"#f87171"):"rgba(255,255,255,0.08)"}`}}>
              <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1rem",color:"#475569",minWidth:28,flexShrink:0,lineHeight:1}}>{e.min}'</span>
              <span style={{flexShrink:0,fontSize:"1rem"}}>{isGoal?"⚽":e.type==="yellow"?"🟨":"🟥"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"0.85rem",fontWeight:600,color:isGoal?(isUs?"#6ee7b7":"#f87171"):isUs?"#f5a623":"#94a3b8",letterSpacing:"0.5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                {isGoal&&e.assist&&<div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.65rem",color:"#475569",marginTop:1}}>↳ {e.assist}</div>}
              </div>
              <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.72rem",color:isUs?"#f5a623":"#475569",letterSpacing:"1px",flexShrink:0}}>{isUs?"YOU":FLAG_ABBR[opp.name]||opp.name?.substring(0,3).toUpperCase()}</div>
            </div>
          );
        })}
        {!shown.length&&simPhase==="regulation"&&(
          <div style={{textAlign:"center",padding:"20px 0",fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.82rem",color:"#64748b",letterSpacing:"3px"}}>MATCH IN PROGRESS…</div>
        )}
      </div>

      {/* Penalties */}
      {simPhase==="pens"&&penResult&&(
        <div style={{background:"linear-gradient(135deg,#1c1a08,#292510)",border:"1px solid rgba(245,166,35,0.3)",borderRadius:6,padding:"16px",textAlign:"center",marginBottom:12}}>
          <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.75rem",letterSpacing:"4px",color:"#f5a623",marginBottom:10}}>PENALTY SHOOTOUT</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
            <div style={{fontFamily:"'Teko',sans-serif",fontSize:"4rem",lineHeight:1,color:myWonPens?"#6ee7b7":"#f1f5f9"}}>{penResult.myScore}</div>
            <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.75rem",color:"#475569",letterSpacing:"2px"}}>PEN</div>
            <div style={{fontFamily:"'Teko',sans-serif",fontSize:"4rem",lineHeight:1,color:!myWonPens?"#f87171":"#f1f5f9"}}>{penResult.oppScore}</div>
          </div>
          <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1rem",fontWeight:600,color:myWonPens?"#6ee7b7":"#f87171",marginTop:8,letterSpacing:"1px"}}>
            {myWonPens?"YOUR SQUAD WIN":opp.name.toUpperCase()+" WIN"}
          </div>
        </div>
      )}

      {simPhase==="done"&&<button className="sb" style={{width:"100%"}} onClick={()=>onComplete(null,regScoreUs,regScoreThem)}>FULL TIME → CONTINUE</button>}
      {simPhase==="pens"&&penResult&&<button className="sb" style={{width:"100%",marginTop:8}} onClick={()=>onComplete(penResult,regScoreUs,regScoreThem)}>RESULT → CONTINUE</button>}
    </div>
  );
};

// ── Knockout Stage System ─────────────────────────────────────────────────────
const KO_LABELS=["R32","R16","QF","SF","FINAL"];

// A Bracket is a full 32-slot tree. Each slot = {name, abbr, isUser, rating, score:null|number, winner:bool}
// The tree is stored as an array of 32 R32 matchups: [{teamA, teamB}]
// After each round, winners advance. YOUR TEAM's slot is tracked so you always know who you face next.

// Build 32-team bracket from group results.
// Returns: { r32Pairs: [{a,b}×16], yourSlot: index 0-31 }
const buildBracket=(allFinalStandings,userGroupIdx,userTeamName,chaos)=>{
  // 2026 WC: 12 groups of 4. Top 2 from each = 24, best 8 third-placed = 8 → 32 total
  const winners=[];const runners=[];const thirds=[];
  const GRP_LABELS=["A","B","C","D","E","F","G","H","I","J","K","L"];
  allFinalStandings.forEach((gs,gi)=>{
    const gid=GRP_LABELS[gi];
    if(gs[0])winners.push({name:gs[0].name,abbr:FLAG_ABBR[gs[0].name]||gs[0].name.substring(0,3).toUpperCase(),isUser:gs[0].isUser,rating:gs[0].rating||78,group:gid,pos:1});
    if(gs[1])runners.push({name:gs[1].name,abbr:FLAG_ABBR[gs[1].name]||gs[1].name.substring(0,3).toUpperCase(),isUser:gs[1].isUser,rating:gs[1].rating||75,group:gid,pos:2});
    if(gs[2])thirds.push({...gs[2],abbr:FLAG_ABBR[gs[2].name]||gs[2].name.substring(0,3).toUpperCase(),group:gid,pos:3});
  });
  // Pick 8 best thirds
  thirds.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
  const top8thirds=thirds.slice(0,8).map(t=>({...t,rating:t.rating||72}));

  // Build exactly 16 R32 matchups = 32 teams:
  // 12 winners + 12 runners-up + 8 best thirds = 32
  // Pairing structure (FIFA 2026 simplified):
  //   Match  1: W1  vs T1   Match  2: W2  vs T2
  //   Match  3: W3  vs T3   Match  4: W4  vs T4
  //   Match  5: W5  vs T5   Match  6: W6  vs T6
  //   Match  7: W7  vs T7   Match  8: W8  vs T8
  //   Match  9: R1  vs R12  Match 10: R2  vs R11
  //   Match 11: R3  vs R10  Match 12: R4  vs R9
  //   Match 13: W9  vs R8   Match 14: W10 vs R7
  //   Match 15: W11 vs R6   Match 16: W12 vs R5
  // Total: 8+4+4 = 16 matches = 32 teams ✓
  const pairs=[];
  // Matches 1-8: winners[0-7] vs top8thirds[0-7]
  for(let i=0;i<8;i++)pairs.push({a:winners[i],b:top8thirds[i]});
  // Matches 9-12: runners[0-3] vs runners[11-8]
  for(let i=0;i<4;i++)pairs.push({a:runners[i],b:runners[11-i]});
  // Matches 13-16: winners[8-11] vs runners[7-4]
  for(let i=0;i<4;i++)pairs.push({a:winners[8+i],b:runners[7-i]});

  // Find YOUR slot
  let yourPairIdx=-1;let yourSide="a";
  pairs.forEach((p,i)=>{
    if(p.a&&p.a.isUser){yourPairIdx=i;yourSide="a";}
    if(p.b&&p.b.isUser){yourPairIdx=i;yourSide="b";}
  });

  // Simulate all NON-user R32 matchups immediately
  const r32Results=pairs.map((p,i)=>{
    if(i===yourPairIdx)return null; // user plays this one
    const rA=p.a?p.a.rating:75;const rB=p.b?p.b.rating:72;
    const aWins=simMatch(rA,rA,rB,rB,chaos);
    const aWon=aWins.myGoals>aWins.oppGoals;
    const draw=aWins.myGoals===aWins.oppGoals;
    const penWin=draw?Math.random()>0.47:null;
    const finallyAWon=draw?penWin:aWon;
    return{winner:finallyAWon?p.a:p.b,scoreA:aWins.myGoals,scoreB:aWins.oppGoals,pens:draw};
  });

  return{pairs,r32Results,yourPairIdx,yourSide};
};

// Full bracket display component — shows all 16 R32 matches in a grid
// ── Full Tournament Bracket — All 32 teams, all rounds ───────────────────────
// Stored as: bracketRounds = [R32matches, R16matches, QFmatches, SFmatches, Final]
// Each match: {a:{name,abbr,isUser}, b:{name,abbr,isUser}, winner, scoreA, scoreB, pens, done, isUserMatch}
// Bot matches are simulated round by round after the user plays theirs.
// This ensures all teams are visible advancing — no "backend manipulation" feel.

const simKOMatch=(rA,rB,chaos)=>{
  const eA=rA||75;const eB=rB||75;
  const r=simMatch(eA,eA,eB,eB,chaos);
  const draw=r.myGoals===r.oppGoals;
  const penWin=draw?Math.random()>0.47:null;
  const aWon=draw?penWin:r.myGoals>r.oppGoals;
  return{scoreA:r.myGoals,scoreB:r.oppGoals,draw,aWon,pens:draw};
};

// After user plays their match in a round, simulate all other matches of that round
// Returns updated roundMatches with all results filled in
const simulateBotMatches=(roundMatches,userMatchIdx,userResult,chaos)=>{
  return roundMatches.map((m,i)=>{
    if(i===userMatchIdx){
      // User's match — apply their result
      const won=userResult.won;
      return{
        ...m,
        scoreA:m.isUserA?userResult.myG:userResult.oppG,
        scoreB:m.isUserA?userResult.oppG:userResult.myG,
        pens:userResult.pens,
        winner:won?(m.isUserA?m.a:m.b):(m.isUserA?m.b:m.a),
        done:true,
      };
    }
    if(m.done)return m;
    // Bot match
    const res=simKOMatch(m.a?.rating||75,m.b?.rating||75,chaos);
    return{
      ...m,
      scoreA:res.scoreA,scoreB:res.scoreB,pens:res.pens,
      winner:res.aWon?m.a:m.b,
      done:true,
    };
  });
};

// Build next round from winners of current round, pairing 1vs2, 3vs4, etc.
const buildNextRound=(completedRound)=>{
  const winners=completedRound.map(m=>m.winner).filter(Boolean);
  const next=[];
  for(let i=0;i<winners.length;i+=2){
    const a=winners[i];const b=winners[i+1];
    const isUserMatch=a?.isUser||b?.isUser;
    next.push({
      a,b,
      isUserA:!!a?.isUser,
      isUserMatch,
      winner:null,scoreA:null,scoreB:null,pens:false,done:false,
    });
  }
  return next;
};

// Find user's match index in a round
const findUserMatchIdx=(roundMatches)=>
  roundMatches.findIndex(m=>m.isUserMatch||m.a?.isUser||m.b?.isUser);

// Build initial R32 from bracketData
const buildInitialR32=(bracketData)=>{
  if(!bracketData)return[];
  const{pairs,r32Results,yourPairIdx}=bracketData;
  return pairs.map((p,i)=>{
    const isUserMatch=i===yourPairIdx;
    return{
      a:p.a||{name:"TBD",abbr:"TBD",isUser:false},
      b:p.b||{name:"TBD",abbr:"TBD",isUser:false},
      isUserA:!!p.a?.isUser,
      isUserMatch,
      winner:null,scoreA:null,scoreB:null,pens:false,done:false,
    };
  });
};

// ── Bracket Match Card ────────────────────────────────────────────────────────
const BMatch=({m,isCurrent})=>{
  if(!m)return<div style={{height:32,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",marginBottom:2,borderRadius:3}}/>;
  const{a,b,done,scoreA,scoreB,pens,winner,isUserMatch}=m;
  const aW=done&&winner?.name===a?.name;
  const bW=done&&winner?.name===b?.name;
  const border=isUserMatch?"rgba(245,166,35,0.55)":isCurrent&&!done?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.06)";
  const bg=isUserMatch?"rgba(245,166,35,0.06)":"rgba(255,255,255,0.02)";
  return(
    <div style={{border:`1px solid ${border}`,background:bg,padding:"3px 5px",marginBottom:2,borderRadius:3,borderLeft:isUserMatch?"3px solid #f5a623":""}}>
      {isUserMatch&&!done&&<div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.52rem",color:"#f5a623",letterSpacing:"1.5px",lineHeight:1.3}}>★ YOU</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:2}}>
        <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.58rem",fontWeight:a?.isUser?700:400,color:a?.isUser?"#f5a623":aW?"#6ee7b7":done&&!aW?"#475569":"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{a?.isUser?"YOU":a?.abbr||"TBD"}</span>
        <span style={{fontFamily:"'Teko',sans-serif",fontSize:"0.65rem",color:done?"#64748b":"#475569",flexShrink:0,minWidth:18,textAlign:"center",letterSpacing:"0.5px"}}>{done&&scoreA!=null?`${scoreA}-${scoreB}`:"v"}</span>
        <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.58rem",fontWeight:b?.isUser?700:400,color:b?.isUser?"#f5a623":bW?"#6ee7b7":done&&!bW?"#475569":"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,textAlign:"right"}}>{b?.isUser?"YOU":b?.abbr||"TBD"}</span>
      </div>
      {done&&pens&&<div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.46rem",color:"#f5a623",textAlign:"center",letterSpacing:"1px"}}>PENS</div>}
    </div>
  );
};

// ── Full Tournament Bracket Display ──────────────────────────────────────────
const RoundLabels=["R32","R16","QF","SF","FINAL"];
const TournamentBracket=({allRounds,currentRound})=>{
  if(!allRounds||!allRounds[0])return null;
  const displayRounds=allRounds.filter(Boolean);
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.6rem",letterSpacing:"4px",color:"#475569",marginBottom:10,textAlign:"center",textTransform:"uppercase"}}>Tournament Bracket</div>
      {displayRounds.map((round,ri)=>{
        const label=RoundLabels[ri]||"";
        const isCurrent=ri===currentRound;
        return(
          <div key={ri} style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{height:"1px",flex:1,background:`linear-gradient(90deg,transparent,${isCurrent?"rgba(245,166,35,0.3)":"rgba(255,255,255,0.06)"})`}}/>
              <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.62rem",letterSpacing:"3px",color:isCurrent?"#f5a623":"#64748b",fontWeight:400,flexShrink:0}}>{label}{isCurrent&&<span style={{color:"#f5a623",marginLeft:6}}>▶ NOW</span>}</div>
              <div style={{height:"1px",flex:1,background:`linear-gradient(90deg,${isCurrent?"rgba(245,166,35,0.3)":"rgba(255,255,255,0.06)"},transparent)`}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {round.map((m,mi)=>(
                <BMatch key={mi} m={m} isCurrent={isCurrent&&!m.done}/>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ── Main Component ────────────────────────────────────────────────────────────
export default function WorldCupDraft(){
  const[phase,setPhase]=useState("difficulty");
  const[difficulty,setDifficulty]=useState(null);
  const[formation,setFormation]=useState(null);
  const[draftMode,setDraftMode]=useState(null);
  const[slots,setSlots]=useState([]);
  const[activeIdx,setActiveIdx]=useState(null);
  const[sfPick,setSfPick]=useState(null);
  const[spinning,setSpinning]=useState(false);
  const[spinResult,setSpinResult]=useState(null);
  const[showModal,setShowModal]=useState(false);
  const[squad,setSquad]=useState([]);
  const[respins,setRespins]=useState(0);
  const[usedCombos,setUsedCombos]=useState({});// {key:count}
  const[boostTriggered,setBoostTriggered]=useState(false);// silent quality boost for WC/Legendary
  

  const[userGroup,setUserGroup]=useState(null);
  const[userGroupIdx,setUserGroupIdx]=useState(null);
  const[allGroups,setAllGroups]=useState(null);
  const[oppFixtures,setOppFixtures]=useState([]); // pre-seeded non-user match results
  const[matchIdx,setMatchIdx]=useState(0);
  const[groupResults,setGroupResults]=useState([]);
  const[liveStandings,setLiveStandings]=useState(null);
  const[simState,setSimState]=useState(null);
  const[finalStandings,setFinalStandings]=useState(null);
  const[allFinalStandings,setAllFinalStandings]=useState(null);
  const[qualStatus,setQualStatus]=useState(null);

  const[koDraws,setKoDraws]=useState([]);
  const[bracketData,setBracketData]=useState(null);
  const[allRounds,setAllRounds]=useState([]); // [R32matches, R16matches, QFmatches, SFmatches, Final]
  const[koResults,setKoResults]=useState([]);
  const[koRound,setKoRound]=useState(0);
  const[koSim,setKoSim]=useState(null);
  const[eliminated,setEliminated]=useState(false);

  const wheelRef=useRef(null);
  const spinAngle=useRef(0);

  const myRating=avgRating(squad);
  const myAtk=atkRating(squad);
  const myDef=defRating(squad);
  const chaos=DIFFICULTIES[difficulty]?.chaos??15;
  const oppMod=DIFFICULTIES[difficulty]?.oppMod??0;
  const filled=slots.filter(s=>s.player).length;

  // ── Draft Helpers ──────────────────────────────────────────────────────────
  // compatibleWithSlot: since player pos arrays are pre-expanded by expandPos(),
  // a simple .includes() check is all that's needed everywhere.
  const compatibleWithSlot=(playerPosArr, slotPos)=>playerPosArr.includes(slotPos);

  const getEligible=(forPos)=>{
    const drafted=new Set(slots.filter(s=>s.player).map(s=>`${s.player.name}|${s.player.rating}`));
    const emptySlotPositions=slots.filter(s=>!s.player).map(s=>s.pos);
    return NATION_YEARS.filter(ny=>{
      const key=`${ny.nation}-${ny.year}`;
      if((usedCombos[key]||0)>=2)return false;
      const entry=NATION_POOL[ny.nation]?.find(e=>e.year===ny.year);
      if(!entry)return false;
      if(forPos){
        // Position-First: must have an undrafted player compatible with the specific slot
        return entry.players.some(p=>compatibleWithSlot(p.pos,forPos)&&!drafted.has(`${p.name}|${p.rating}`));
      }
      // Spin-First: must have an undrafted player compatible with at least one remaining empty slot
      if(emptySlotPositions.length>0){
        return entry.players.some(p=>!drafted.has(`${p.name}|${p.rating}`)&&emptySlotPositions.some(pos=>compatibleWithSlot(p.pos,pos)));
      }
      // Fallback: no empty slots tracked yet, just check any undrafted player exists
      return entry.players.some(p=>!drafted.has(`${p.name}|${p.rating}`));
    });
  };

  const doSpin=useCallback((forPos)=>{
    if(spinning)return;
    const eligible=getEligible(forPos);
    if(!eligible.length){setActiveIdx(null);alert("No eligible nations for this position — try another slot.");return;}
    setSpinning(true);setSpinResult(null);

    // ── Silent quality boost for World Class / Legendary ──────────────────
    // Activates when: hard difficulty + 3+ picks made + squad OVR drops below 83
    // Stays on in the 83-84 band once triggered (hysteresis)
    // Deactivates silently when squad OVR reaches 85+
    // Effect: nation-years with an 85+ player for any unfilled slot
    //         get 4 extra entries in the pool (5x more likely to be picked)
    const filledCount=slots.filter(s=>s.player).length;
    const currentOvr=avgRating(slots);
    const isHardDiff=difficulty==="World Class"||difficulty==="Legendary";
    const shouldTrigger=isHardDiff&&filledCount>=3&&currentOvr<83;
    const shouldExit=currentOvr>=85;
    const newBoostState=shouldExit?false:(shouldTrigger?true:boostTriggered);
    if(newBoostState!==boostTriggered)setBoostTriggered(newBoostState);
    let pool=eligible;
    if(newBoostState){
      const emptySlotPositions=slots.filter(s=>!s.player).map(s=>s.pos);
      const checkPos=forPos?[forPos]:emptySlotPositions;
      const boosted=eligible.filter(ny=>{
        const entry=NATION_POOL[ny.nation]?.find(e=>e.year===ny.year);
        if(!entry)return false;
        return entry.players.some(p=>p.rating>=85&&checkPos.some(pos=>compatibleWithSlot(p.pos,pos)));
      });
      // Only apply weighting if boosted options exist
      if(boosted.length>0){
        pool=[...eligible,...boosted,...boosted,...boosted,...boosted];
      }
    }
    const pick=pickRandom(pool);
    const dur=1600+Math.random()*700;
    spinAngle.current+=(4+Math.floor(Math.random()*3))*360;
    if(wheelRef.current){wheelRef.current.style.transition=`transform ${dur}ms cubic-bezier(.17,.67,.12,.99)`;wheelRef.current.style.transform=`rotate(${spinAngle.current}deg)`;}
    setTimeout(()=>{
      const entry=NATION_POOL[pick.nation]?.find(e=>e.year===pick.year);
      if(entry){
        setSpinResult({nation:pick.nation,year:pick.year,players:entry.players});
        setUsedCombos(p=>{const k=`${pick.nation}-${pick.year}`;return{...p,[k]:(p[k]||0)+1};});
      }
      setSpinning(false);setShowModal(true);
    },dur);
  },[spinning,slots,usedCombos,boostTriggered,difficulty]);

  const doRespin=()=>{
    if(respins<=0&&difficulty)return;
    setShowModal(false);setSpinResult(null);
    if(difficulty)setRespins(r=>r-1);
    const pos=draftMode==="position-first"?slots[activeIdx]?.pos:null;
    setTimeout(()=>doSpin(pos),150);
  };

  const assignPlayer=(slotIdx,player)=>{
    const ns=slots.map(s=>s.idx===slotIdx?{...s,player}:s);
    setSlots(ns);setSquad(ns);setShowModal(false);setSpinResult(null);setSfPick(null);setActiveIdx(null);
  };

  const initFormation=f=>{
    const s=FORMATION_LAYOUT[f].map((item,i)=>({pos:item.pos,idx:i,player:null}));
    setFormation(f);setSlots(s);setSquad(s);setUsedCombos({});setBoostTriggered(false);
    NATION_YEARS=buildShuffledPool(); // fresh shuffle every draft
    setPhase("draftmode");
  };

  // ── Tournament ─────────────────────────────────────────────────────────────
  const setupTournament=()=>{
    const gi=Math.floor(Math.random()*WC2026_GROUPS.length);
    const base=WC2026_GROUPS[gi];
    const weakest=base.teams.reduce((a,b)=>a.rating<b.rating?a:b);
    const myTeam={name:"YOUR TEAM",flag:"⭐",rating:myRating,isUser:true};
    const newTeams=base.teams.map(t=>t.name===weakest.name?myTeam:t);
    const myGrp={...base,teams:newTeams};
    const all=WC2026_GROUPS.map((g,i)=>i===gi?myGrp:g);
    const opps=myGrp.teams.filter(t=>!t.isUser);
    // Seed all non-user fixtures ONCE — never re-randomised
    const seededFixtures=seedOppFixtures(opps,chaos);
    setUserGroupIdx(gi);setUserGroup(myGrp);setAllGroups(all);
    setOppFixtures(seededFixtures);
    setMatchIdx(0);setGroupResults([]);setLiveStandings(null);
    setPhase("allgroups");
  };

  const getOpps=()=>userGroup?userGroup.teams.filter(t=>!t.isUser):[];

  const playGroupMatch=()=>{
    const opp=getOpps()[matchIdx];
    const oppR=opp.rating+oppMod;
    const r=simMatch(myAtk,myDef,oppR,oppR,chaos);
    const built=buildEvents(r.myGoals,r.oppGoals,squad,opp.name);
    setSimState({myG:built.myG,opG:built.opG,events:built.events,opp});
  };

  const resolveGroupMatch=()=>{
    const newRes=[...groupResults,{myGoals:simState.myG,oppGoals:simState.opG,opp:simState.opp}];
    setGroupResults(newRes);setSimState(null);
    const myTeam={name:"YOUR TEAM",flag:"⭐",rating:myRating,isUser:true};
    const matchday=newRes.length; // 1, 2, or 3
    const standing=computeStandings(newRes,myTeam,userGroup.teams,oppFixtures,matchday);
    setLiveStandings(standing);
    if(matchIdx<2){setMatchIdx(i=>i+1);setPhase("groupmatch");}
    else{
      // All 3 matchdays done — compute final standings for all groups
      const allS=allGroups.map((g,gi)=>{
        if(gi===userGroupIdx)return standing.map(t=>({...t,groupId:g.id}));
        return simGroup(g.teams,chaos).map(t=>({...t,groupId:g.id}));
      });
      setFinalStandings(standing);setAllFinalStandings(allS);
      const pos=standing.findIndex(t=>t.isUser);
      let qs;
      if(pos===0)qs="1st";
      else if(pos===1)qs="2nd";
      else if(pos===2){
        const thirds=allS.map(gs=>gs[2]).filter(Boolean);
        thirds.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
        qs=thirds.slice(0,8).some(t=>t.isUser)?"3rd-ok":"eliminated";
      }else qs="eliminated";
      setQualStatus(qs);setPhase("groupdone");
    }
  };

  

  const startKO=()=>{
    const bracket=buildBracket(allFinalStandings,userGroupIdx,"YOUR TEAM",chaos);
    setBracketData(bracket);
    const r32=buildInitialR32(bracket);
    const userMatch=r32.find(m=>m.isUserMatch);
    const r32Opp=userMatch?.isUserA?userMatch.b:userMatch.a;
    setAllRounds([r32]);
    setKoDraws([{opp:{name:r32Opp?.name||"Opponent",rating:r32Opp?.rating||75,abbr:r32Opp?.abbr||"OPP"}}]);
    setKoResults([]);setKoRound(0);setEliminated(false);
    setPhase("kodraw");
  };

  const playKOMatch=()=>{
    const opp=koDraws[koRound].opp;
    const oppR=opp.rating+oppMod;
    const r=simMatch(myAtk,myDef,oppR,oppR,chaos);
    const built=buildEvents(r.myGoals,r.oppGoals,squad,opp.name);
    setKoSim({myG:built.myG,opG:built.opG,events:built.events,opp,penResult:null});
    setPhase("komatch");
  };

  const resolveKOMatch=(penResult,actualMyG,actualOpG)=>{
    const opp=koDraws[koRound].opp;
    // Use the scores actually shown on screen (event counts) — these are the ground truth
    // This prevents any mismatch between the display and what gets recorded in the bracket
    const finalMyG=actualMyG!==undefined?actualMyG:koSim.myG;
    const finalOpG=actualOpG!==undefined?actualOpG:koSim.opG;
    const draw=finalMyG===finalOpG;
    // If penalties: use the result from MatchSim's simPenalties (passed in)
    const penWin=draw&&penResult?penResult.myScore>penResult.oppScore:(draw?Math.random()>0.47:null);
    const won=draw?penWin:finalMyG>finalOpG;
    const userResult={myG:finalMyG,oppG:finalOpG,myGoals:finalMyG,oppGoals:finalOpG,opp,pens:draw,penWin,won};
    const koRes={...userResult,opG:finalOpG};
    const nr=[...koResults,koRes];
    setKoResults(nr);setKoSim(null);

    // Complete this round for ALL teams then build next
    setAllRounds(prev=>{
      const curRound=[...(prev[koRound]||[])];
      const userIdx=findUserMatchIdx(curRound);
      const completed=simulateBotMatches(curRound,userIdx,userResult,chaos);
      const next=[...prev];
      next[koRound]=completed;

      if(!won){
        setEliminated(true);setPhase("done");
        return next;
      }
      if(koRound>=4){setPhase("done");return next;}

      const nextRound=buildNextRound(completed);
      next[koRound+1]=nextRound;
      const nextUserMatch=nextRound.find(m=>m.isUserMatch);
      const nextOpp=nextUserMatch?.isUserA?nextUserMatch.b:nextUserMatch.a;
      setKoDraws(d=>[...d,{opp:{name:nextOpp?.name||"Opponent",rating:nextOpp?.rating||80,abbr:nextOpp?.abbr||"OPP"}}]);
      setKoRound(r=>r+1);
      setPhase("kostart");
      return next;
    });
  };

  const reset=()=>{
    setPhase("difficulty");setDifficulty(null);setFormation(null);setDraftMode(null);
    setSlots([]);setSquad([]);setActiveIdx(null);setSfPick(null);setSpinResult(null);setShowModal(false);setRespins(0);setUsedCombos({});setBoostTriggered(false);
    setUserGroup(null);setUserGroupIdx(null);setAllGroups(null);setOppFixtures([]);setMatchIdx(0);setGroupResults([]);setLiveStandings(null);setSimState(null);setFinalStandings(null);setAllFinalStandings(null);setQualStatus(null);
    setKoDraws([]);setBracketData(null);setAllRounds([]);setKoResults([]);setKoRound(0);setKoSim(null);setEliminated(false);
    if(wheelRef.current){wheelRef.current.style.transform="rotate(0deg)";wheelRef.current.style.transition="none";}
    spinAngle.current=0;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:"#080c14",fontFamily:"'Saira Condensed','Arial Narrow',sans-serif",color:"#cbd5e1",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&family=Kanit:wght@300;400;500;600;700&family=Saira+Condensed:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#f5a623;border-radius:2px}
        ::-webkit-scrollbar-track{background:transparent}
        .sb{background:linear-gradient(135deg,#d97706,#f5a623);border:none;color:#1c1007;font-family:'Teko',sans-serif;font-size:1.1rem;font-weight:500;letter-spacing:3px;padding:12px 26px;cursor:pointer;text-transform:uppercase;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);transition:all .18s;line-height:1}
        .sb:hover:not(:disabled){transform:scale(1.03);box-shadow:0 4px 20px rgba(245,166,35,0.25)}
        .sb:disabled{opacity:.3;cursor:not-allowed}
        .gb{background:transparent;border:1px solid rgba(255,255,255,0.1);color:#475569;font-family:'Saira Condensed',sans-serif;padding:9px 18px;cursor:pointer;letter-spacing:2px;font-size:0.76rem;transition:all .18s;text-transform:uppercase;border-radius:2px}
        .gb:hover{border-color:rgba(255,255,255,0.25);color:#94a3b8}
        .cb{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);color:#cbd5e1;font-family:'Saira Condensed',sans-serif;padding:16px;cursor:pointer;text-align:left;transition:all .2s;width:100%;border-radius:4px}
        .cb:hover{background:rgba(245,166,35,0.06);border-color:rgba(245,166,35,0.35);transform:translateX(3px)}
        .pr{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:9px 11px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;width:100%;font-family:'Saira Condensed',sans-serif;transition:all .15s;border-radius:3px}
        .pr:hover:not(:disabled){background:rgba(245,166,35,0.06);border-color:rgba(245,166,35,0.3);transform:translateX(3px)}
        .pr:disabled{opacity:.2;cursor:not-allowed}
        .sec{max-width:520px;margin:0 auto;padding:22px 16px}
        .tag{font-family:'Saira Condensed',sans-serif;font-size:0.6rem;letter-spacing:4px;color:#475569;margin-bottom:6px;text-transform:uppercase}
        .h1{font-family:'Kanit',sans-serif;font-size:clamp(1.5rem,5.5vw,2.2rem);font-weight:600;letter-spacing:0.5px;text-transform:uppercase;line-height:1.1;color:#f1f5f9}
        .chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:3px;font-family:'Saira Condensed',sans-serif;font-size:0.72rem;letter-spacing:1px}
        .chip-amber{background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.25);color:#f5a623}
        .chip-teal{background:rgba(110,231,183,0.08);border:1px solid rgba(110,231,183,0.2);color:#6ee7b7}
        .chip-blue{background:rgba(147,197,253,0.08);border:1px solid rgba(147,197,253,0.2);color:#93c5fd}
        .chip-slate{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#94a3b8}
        .div{height:1px;background:rgba(255,255,255,0.07);margin:14px 0}
        .panel{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:5px;padding:14px}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes glow{0%,100%{text-shadow:0 0 12px rgba(245,166,35,0.4)}50%{text-shadow:0 0 30px rgba(245,166,35,0.7),0 0 60px rgba(245,166,35,0.2)}}
        @keyframes tb{from{transform:scale(1) rotate(-3deg)}to{transform:scale(1.06) rotate(3deg)}}
        .pulse{animation:pulse 1.2s infinite}
        .tb{animation:tb .8s ease infinite alternate}
      `}</style>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"22px 16px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% -20%,rgba(245,166,35,0.08) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <h1 style={{fontFamily:"'Kanit',sans-serif",fontSize:"clamp(1.9rem,7vw,3rem)",fontWeight:700,letterSpacing:"1px",lineHeight:1,color:"#f1f5f9"}}>
          BE A <span style={{color:"#f5a623",fontFamily:"'Teko',sans-serif",fontWeight:400,fontSize:"clamp(2.2rem,8vw,3.5rem)",letterSpacing:"2px"}}>WORLD CHAMPION</span>
        </h1>
        <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.56rem",letterSpacing:"5px",color:"#64748b",marginTop:4}}>2026 FORMAT · ALL-ERA LEGENDS</div>
      </div>

      {/* DIFFICULTY */}
      {phase==="difficulty"&&(
        <div className="sec">
          <div className="tag">Step 1 of 4</div>
          <div className="h1" style={{marginBottom:16}}>Choose Difficulty</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {Object.entries(DIFFICULTIES).map(([k,d])=>{
              const spinLabel=d.respins===0?"No respins":d.respins===1?"1 respin":`${d.respins} respins`;
              return(
                <button key={k} className="cb" onClick={()=>{setDifficulty(k);setRespins(d.respins);setPhase("formation");}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                    <div style={{fontFamily:"'Teko',sans-serif",fontSize:"1.5rem",fontWeight:500,letterSpacing:"1px",color:"#f5a623",lineHeight:1}}>{k.toUpperCase()}</div>
                    <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.82rem",letterSpacing:"2px",color:"#475569"}}>{spinLabel.toUpperCase()}</div>
                  </div>
                  <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.76rem",color:"#475569",lineHeight:1.4}}>{d.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FORMATION */}
      {phase==="formation"&&(
        <div className="sec">
          <div className="tag">Step 2 of 4 · {difficulty}</div>
          <div className="h1" style={{marginBottom:16}}>Formation</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {FORMATIONS.map(f=>(
              <button key={f} className="cb" style={{textAlign:"center",padding:"18px 6px"}} onClick={()=>initFormation(f)}>
                <div style={{fontFamily:"'Teko',sans-serif",fontSize:"2rem",fontWeight:400,letterSpacing:"3px",color:"#f1f5f9",lineHeight:1}}>{f}</div>
              </button>
            ))}
          </div>
          <button className="gb" style={{marginTop:14,width:"100%"}} onClick={()=>setPhase("difficulty")}>← Back</button>
        </div>
      )}

      {/* DRAFT MODE */}
      {phase==="draftmode"&&(
        <div className="sec">
          <div className="tag">Step 3 of 4 · {formation}</div>
          <div className="h1" style={{marginBottom:16}}>Draft Style</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{mode:"position-first",icon:"🎯",label:"POSITION-FIRST",desc:"Tap a slot on the pitch first, then spin. Only compatible players shown — guaranteed to fill."},
              {mode:"spin-first",icon:"🎰",label:"SPIN-FIRST",desc:"Spin freely, browse the full squad from that nation & year, pick any player then place them."}
            ].map(({mode,icon,label,desc})=>(
              <button key={mode} className="cb" onClick={()=>{setDraftMode(mode);setPhase("draft");}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:"1.5rem"}}>{icon}</span>
                  <div style={{fontFamily:"'Teko',sans-serif",fontSize:"1.2rem",fontWeight:500,color:"#f5a623",letterSpacing:"2px"}}>{label}</div>
                </div>
                <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.76rem",color:"#475569",lineHeight:1.5}}>{desc}</div>
              </button>
            ))}
          </div>
          <button className="gb" style={{marginTop:14,width:"100%"}} onClick={()=>setPhase("formation")}>← Back</button>
        </div>
      )}

      {/* DRAFT — stacked: pitch full width, wheel below */}
      {phase==="draft"&&(
        <div style={{maxWidth:480,margin:"0 auto",padding:"16px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.4rem",color:"#f5a623",letterSpacing:"2px",lineHeight:1}}>{formation}</span>
              <span className="chip chip-slate" style={{fontSize:"0.62rem"}}>{draftMode==="position-first"?"POS-FIRST":"SPIN-FIRST"}</span>
              <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.88rem",color:"#94a3b8",fontWeight:600}}>{filled}/11</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {respins>0&&<span className="chip chip-amber" style={{fontSize:"0.7rem"}}>↺ {respins} left</span>}
              {filled===11&&<button className="sb" style={{fontSize:"0.95rem",padding:"9px 20px"}} onClick={()=>setPhase("lineup")}>DONE →</button>}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            {draftMode==="position-first"&&(
              <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.66rem",letterSpacing:"3px",color:"#64748b",marginBottom:8,textTransform:"uppercase",textAlign:"center"}}>
                {activeIdx!==null?<span>Filling: <strong style={{color:"#f5a623",fontSize:"0.8rem"}}>{slots[activeIdx]?.pos}</strong> — now spin</span>:"Tap a position to select it, then spin"}
              </div>
            )}
            <Pitch formation={formation} slots={slots} activeIdx={activeIdx}
              onSlot={i=>{if(draftMode==="position-first"&&!slots[i]?.player)setActiveIdx(i);}}
              clickable={draftMode==="position-first"}/>
          </div>
          {(draftMode==="spin-first"||activeIdx!==null)&&filled<11&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"18px 0 6px"}}>
              {draftMode==="spin-first"&&(
                <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.72rem",color:"#64748b",letterSpacing:"2px",textAlign:"center",textTransform:"uppercase"}}>Spin · Pick a player · Place on pitch</div>
              )}
              <div style={{position:"relative",width:220,height:220}}>
                <div style={{position:"absolute",inset:-5,borderRadius:"50%",border:"1px solid rgba(245,166,35,0.12)",pointerEvents:"none"}}/>
                <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"9px solid transparent",borderRight:"9px solid transparent",borderTop:"18px solid #f5a623",zIndex:10,filter:"drop-shadow(0 0 6px rgba(245,166,35,0.5))"}}/>
                <div ref={wheelRef} style={{width:220,height:220,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.08)",
                  background:`conic-gradient(${NATION_YEARS.map((ny,i)=>{const c=["#0d1117","#111827","#0f172a","#0a0f1a"][i%4];const s=(i/NATION_YEARS.length*100).toFixed(1);const e=((i+1)/NATION_YEARS.length*100).toFixed(1);return`${c} ${s}% ${e}%`;}).join(",")})`,
                  display:"flex",alignItems:"center",justifyContent:"center",boxShadow:spinning?"0 0 30px rgba(245,166,35,0.15)":"none",transition:"box-shadow 0.3s"}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:"#080c14",border:"2px solid rgba(245,166,35,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",boxShadow:"inset 0 0 12px rgba(0,0,0,0.6)"}}>⚽</div>
                </div>
              </div>
              <button className="sb" style={{minWidth:180,fontSize:"1.05rem"}} onClick={()=>doSpin(draftMode==="position-first"?slots[activeIdx]?.pos:null)} disabled={spinning}>
                {spinning?"SPINNING…":"SPIN THE WHEEL"}
              </button>
              {spinning&&<div className="pulse" style={{fontFamily:"'Teko',sans-serif",color:"#f5a623",fontSize:"0.75rem",letterSpacing:"4px"}}>DRAWING…</div>}
            </div>
          )}
          {draftMode==="position-first"&&activeIdx===null&&filled<11&&(
            <div style={{textAlign:"center",padding:"24px 0",fontFamily:"'Saira Condensed',sans-serif",color:"#64748b",fontSize:"0.82rem",letterSpacing:"2px"}}>↑ TAP A POSITION ABOVE TO DRAFT</div>
          )}
        </div>
      )}

      {/* LINEUP */}
      {phase==="lineup"&&(
        <div className="sec">
          <div className="tag">Step 4 of 4</div>
          <div className="h1" style={{marginBottom:10}}>Your Lineup</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <span className="chip chip-amber"><span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.1rem",lineHeight:1}}>{myRating}</span> OVR</span>
            <span className="chip chip-teal">ATK <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.1rem",lineHeight:1,marginLeft:3}}>{myAtk}</span></span>
            <span className="chip chip-blue">DEF <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.1rem",lineHeight:1,marginLeft:3}}>{myDef}</span></span>
          </div>
          <Pitch formation={formation} slots={slots} clickable={false}/>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button className="gb" style={{flex:1}} onClick={()=>setPhase("draft")}>← Edit</button>
            <button className="sb" style={{flex:2}} onClick={setupTournament}>START TOURNAMENT →</button>
          </div>
        </div>
      )}

      {/* ALL GROUPS */}
      {phase==="allgroups"&&(
        <div className="sec">
          <div className="tag">2026 FIFA World Cup · Group Stage Draw</div>
          <div className="h1" style={{marginBottom:6}}>The Draw</div>
          <div style={{fontFamily:"'Saira Condensed',sans-serif",color:"#475569",fontSize:"0.78rem",marginBottom:16}}>
            You're in <span style={{color:"#f5a623",fontWeight:600}}>Group {userGroup?.id}</span>, replacing the weakest team.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {WC2026_GROUPS.map((g,gi)=>{
              const isU=gi===userGroupIdx;
              const teams=isU?userGroup.teams:g.teams;
              return(
                <div key={g.id} style={{border:`1px solid ${isU?"rgba(245,166,35,0.4)":"rgba(255,255,255,0.06)"}`,padding:"9px 10px",background:isU?"rgba(245,166,35,0.04)":"rgba(255,255,255,0.015)",borderRadius:4}}>
                  <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.88rem",letterSpacing:"2px",color:isU?"#f5a623":"#64748b",marginBottom:6,fontWeight:500}}>GROUP {g.id}{isU&&<span style={{marginLeft:5}}>★</span>}</div>
                  {teams.map(t=>(
                    <div key={t.name} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 0"}}>
                      <span style={{fontSize:"0.8rem"}}>{t.flag||""}</span>
                      <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.76rem",color:t.isUser?"#f5a623":isU?"#cbd5e1":"#475569",fontWeight:t.isUser?600:400,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                      <span style={{fontFamily:"'Teko',sans-serif",fontSize:"0.85rem",color:"#64748b",letterSpacing:"0.5px"}}>{t.rating}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{textAlign:"center"}}>
            <button className="sb" onClick={()=>{setMatchIdx(0);setPhase("groupmatch");}}>BEGIN GROUP STAGE →</button>
          </div>
        </div>
      )}

      {/* GROUP MATCH */}
      {phase==="groupmatch"&&userGroup&&(
        <div className="sec">
          <div className="tag">Group {userGroup.id} — Match {matchIdx+1} of 3</div>
          {!simState?(
            <>
              <div className="panel" style={{marginBottom:12}}>
                <div style={{fontFamily:"'Saira Condensed',sans-serif",color:"#64748b",marginBottom:5,letterSpacing:"2px",fontSize:"0.65rem",textTransform:"uppercase"}}>Your Group</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{userGroup.teams.map(t=><span key={t.name} style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.78rem",color:t.isUser?"#f5a623":"#475569",display:"flex",alignItems:"center",gap:3}}><FlagBadge name={t.name}/>{t.name}</span>)}</div>
              </div>
              {liveStandings&&matchIdx>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.62rem",letterSpacing:"3px",color:"#64748b",marginBottom:8,textTransform:"uppercase"}}>Standings After {matchIdx} Match{matchIdx>1?"es":""}</div>
                  <GTable standings={liveStandings}/>
                </div>
              )}
              <div style={{textAlign:"center",marginBottom:14,padding:"18px",background:"linear-gradient(135deg,#0f172a,#1a2336)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(245,166,35,0.05) 0%,transparent 65%)",pointerEvents:"none"}}/>
                <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.6rem",letterSpacing:"3px",color:"#64748b",marginBottom:6,textTransform:"uppercase"}}>Next Opponent</div>
                <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1.6rem",fontWeight:600,color:"#f1f5f9",letterSpacing:"0.5px"}}>{getOpps()[matchIdx]?.flag} {getOpps()[matchIdx]?.name}</div>
                <div style={{fontFamily:"'Teko',sans-serif",fontSize:"1.1rem",color:"#475569",marginTop:4,letterSpacing:"1px"}}>{getOpps()[matchIdx]?.rating} <span style={{fontSize:"0.75rem",letterSpacing:"2px",opacity:0.6}}>OVR</span></div>
              </div>
              {groupResults.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.62rem",letterSpacing:"3px",color:"#64748b",marginBottom:8,textTransform:"uppercase"}}>Results So Far</div>
                  {groupResults.map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:3,marginBottom:4}}>
                      <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.78rem",color:"#f5a623",fontWeight:600}}>★ You</span>
                      <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.4rem",fontWeight:400,color:r.myGoals>r.oppGoals?"#6ee7b7":r.myGoals<r.oppGoals?"#f87171":"#cbd5e1",letterSpacing:"1px"}}>{r.myGoals}–{r.oppGoals}</span>
                      <span style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.78rem",color:"#475569"}}>{r.opp.flag} {r.opp.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{textAlign:"center"}}><button className="sb" onClick={playGroupMatch}>KICK OFF ⚽</button></div>
            </>
          ):(
            <MatchSim myG={simState.myG} opG={simState.opG} events={simState.events} opp={simState.opp} onComplete={resolveGroupMatch}/>
          )}
        </div>
      )}

      {/* GROUP DONE */}
      {phase==="groupdone"&&finalStandings&&(
        <div className="sec">
          <div className="tag">Group Stage Complete</div>
          {qualStatus==="eliminated"?(
            <div style={{textAlign:"center",paddingTop:22}}>
              <div style={{fontSize:"3.5rem",marginBottom:12}}>💔</div>
              <div className="h1" style={{color:"#f87171",marginBottom:8}}>ELIMINATED</div>
              <div style={{fontFamily:"'Saira Condensed',sans-serif",color:"#475569",fontSize:"0.82rem",marginBottom:22}}>You didn't qualify from Group {userGroup?.id}.</div>
              <button className="sb" onClick={reset}>PLAY AGAIN ↺</button>
            </div>
          ):(
            <>
              <div style={{marginBottom:10}}>
                <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.1rem",letterSpacing:"2px",color:qualStatus==="1st"?"#f5a623":qualStatus==="2nd"?"#6ee7b7":"#fb923c"}}>
                  {qualStatus==="1st"&&"★ GROUP WINNERS — INTO R32!"}
                  {qualStatus==="2nd"&&"● RUNNERS-UP — INTO R32!"}
                  {qualStatus==="3rd-ok"&&"◐ 3RD PLACE — QUALIFIED!"}
                </span>
              </div>
              <div className="div"/>
              <div style={{marginBottom:14}}>
                <div className="tag" style={{marginBottom:8}}>Group {userGroup?.id} Final</div>
                <GTable standings={finalStandings}/>
              </div>
              <div style={{marginBottom:16}}>
                <div className="tag" style={{marginBottom:10}}>All 12 Groups — Final</div>
                {(()=>{
                  if(!allFinalStandings)return null;
                  const thirds=allFinalStandings.map((gs,gi)=>({...gs[2],groupIdx:gi})).filter(Boolean);
                  thirds.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
                  const top8thirds=new Set(thirds.slice(0,8).map(t=>t.name));
                  return(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                      {allFinalStandings.map((gs,gi)=>{
                        const gId=WC2026_GROUPS[gi].id;const isUG=gi===userGroupIdx;
                        return(
                          <div key={gId} style={{border:`1px solid ${isUG?"rgba(245,166,35,0.35)":"rgba(255,255,255,0.05)"}`,padding:"7px 8px",background:isUG?"rgba(245,166,35,0.03)":"transparent",borderRadius:3}}>
                            <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.72rem",letterSpacing:"2px",color:isUG?"#f5a623":"#64748b",marginBottom:5,fontWeight:500}}>GRP {gId}{isUG&&" ★"}</div>
                            {gs.slice(0,4).map((t,ti)=>{
                              const isThirdQual=ti===2&&top8thirds.has(t.name);
                              return(
                                <div key={t.name} style={{display:"flex",justifyContent:"space-between",padding:"1px 0",fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.64rem",
                                  color:t.isUser?"#f5a623":ti<2?"#94a3b8":isThirdQual?"#fb923c":"#475569",fontWeight:t.isUser?600:400}}>
                                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:72}}>{ti<2?"●":isThirdQual?"◐":"○"} {t.name}</span>
                                  <span>{t.pts}p</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.6rem",color:"#64748b",marginTop:8}}>● auto-qualified · ◐ best 3rd place qualified</div>
              </div>
              <button className="sb" style={{width:"100%"}} onClick={startKO}>BEGIN KNOCKOUT STAGE →</button>
            </>
          )}
        </div>
      )}

      {/* KO DRAW */}
      {phase==="kodraw"&&(
        <div className="sec">
          <div className="tag">Knockout Stage — The Draw</div>
          <div className="h1" style={{marginBottom:6}}>Round of 32</div>
          <div style={{fontFamily:"'Saira Condensed',sans-serif",color:"#475569",fontSize:"0.78rem",marginBottom:14}}>All 32 teams set. Your match is highlighted in amber.</div>
          <TournamentBracket allRounds={allRounds} currentRound={0}/>
          <div className="panel" style={{marginBottom:14,textAlign:"center"}}>
            <div className="tag" style={{marginBottom:5}}>Your R32 Opponent</div>
            <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1.4rem",fontWeight:600,color:"#f1f5f9"}}>{koDraws[0]&&koDraws[0].opp?koDraws[0].opp.name:""}</div>
            {koDraws[0]&&koDraws[0].opp&&<div style={{fontFamily:"'Teko',sans-serif",fontSize:"1rem",color:"#475569",marginTop:4,letterSpacing:"1px"}}>{koDraws[0].opp.rating} OVR</div>}
          </div>
          <button className="sb" style={{width:"100%"}} onClick={()=>setPhase("kostart")}>PLAY R32 →</button>
        </div>
      )}

      {/* KO START */}
      {phase==="kostart"&&(
        <div className="sec">
          <div className="tag">Bracket — {KO_LABELS[koRound]} Up Next</div>
          <div className="h1" style={{marginBottom:12}}>{KO_LABELS[koRound]}</div>
          <TournamentBracket allRounds={allRounds} currentRound={koRound}/>
          {koDraws[koRound]&&(
            <div className="panel" style={{marginBottom:14,textAlign:"center"}}>
              <div className="tag" style={{marginBottom:5}}>Your {KO_LABELS[koRound]} Opponent</div>
              <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1.4rem",fontWeight:600,color:"#f1f5f9"}}>{koDraws[koRound].opp.name}</div>
              <div style={{fontFamily:"'Teko',sans-serif",fontSize:"1rem",color:"#475569",marginTop:4,letterSpacing:"1px"}}>{koDraws[koRound].opp.rating} OVR</div>
            </div>
          )}
          <button className="sb" style={{width:"100%"}} onClick={playKOMatch}>PLAY {KO_LABELS[koRound]} →</button>
        </div>
      )}

      {/* KO MATCH */}
      {phase==="komatch"&&koSim&&(
        <div className="sec">
          <div className="tag">{KO_LABELS[koRound]}</div>
          <TournamentBracket allRounds={allRounds} currentRound={koRound}/>
          <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1.4rem",fontWeight:600,marginBottom:2,color:"#f1f5f9"}}>{koSim.opp.name}</div>
          <div style={{fontFamily:"'Teko',sans-serif",fontSize:"0.9rem",color:"#475569",marginBottom:12,letterSpacing:"1px"}}>{koSim.opp.rating} OVR</div>
          <MatchSim myG={koSim.myG} opG={koSim.opG} events={koSim.events} opp={koSim.opp} onComplete={resolveKOMatch} isKO={true}/>
        </div>
      )}

      {/* DONE */}
      {phase==="done"&&(
        <div className="sec" style={{textAlign:"center",paddingTop:24}}>
          {!eliminated?(
            <>
              <div className="tb" style={{fontSize:"5rem",marginBottom:12}}>🏆</div>
              <div className="h1" style={{color:"#f5a623",marginBottom:6,animation:"glow 2s ease infinite"}}>WORLD CHAMPIONS!</div>
              <div style={{fontFamily:"'Saira Condensed',sans-serif",color:"#475569",fontSize:"0.82rem",marginBottom:20}}>Your all-era squad conquered the 2026 World Cup</div>
            </>
          ):(
            <>
              <div style={{fontSize:"4rem",marginBottom:12}}>💔</div>
              <div className="h1" style={{color:"#f87171",marginBottom:6}}>ELIMINATED</div>
              <div style={{fontFamily:"'Saira Condensed',sans-serif",color:"#475569",fontSize:"0.82rem",marginBottom:20}}>Knocked out in the {KO_LABELS[koRound]}</div>
            </>
          )}
          <TournamentBracket allRounds={allRounds} currentRound={koRound}/>
          <div className="div"/>
          <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.82rem",color:"#94a3b8",marginBottom:12}}>Squad OVR: <span style={{fontFamily:"'Teko',sans-serif",fontSize:"1.4rem",color:"#f5a623",letterSpacing:"1px"}}>{myRating}</span></div>
          <button className="sb" onClick={reset}>PLAY AGAIN ↺</button>
        </div>
      )}

      {/* PLAYER PICK MODAL */}
      {showModal&&spinResult&&(
        <div style={{position:"fixed",inset:0,background:"rgba(4,7,14,0.97)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:14,backdropFilter:"blur(4px)"}}>
          <div style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",maxWidth:400,width:"100%",maxHeight:"88vh",overflowY:"auto",borderRadius:6,padding:18}}>
            <div style={{textAlign:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="tag" style={{marginBottom:4}}>Wheel Result</div>
              <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1.6rem",fontWeight:600,color:"#f1f5f9",letterSpacing:"0.5px"}}>{spinResult.nation}</div>
              <div style={{fontFamily:"'Teko',sans-serif",fontSize:"1.1rem",color:"#f5a623",letterSpacing:"2px",marginBottom:3}}>WC {spinResult.year}</div>
              <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.75rem",color:"#64748b"}}>
                {draftMode==="position-first"?<>Showing players for <strong style={{color:"#94a3b8"}}>{slots[activeIdx]?.pos}</strong></>:"Pick any player, then assign a slot"}
              </div>
              {respins>0&&<div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.72rem",color:"#64748b",marginTop:4}}>Respins remaining: <span style={{color:"#f5a623",fontFamily:"'Teko',sans-serif",fontSize:"1rem"}}>{respins}</span></div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {(()=>{
                const slotPos=draftMode==="position-first"?slots[activeIdx]?.pos:null;
                const drafted=new Set(slots.filter(s=>s.player).map(s=>`${s.player.name}|${s.player.rating}`));
                const visible=slotPos
                  ?spinResult.players.filter(p=>compatibleWithSlot(p.pos,slotPos)&&!drafted.has(`${p.name}|${p.rating}`))
                  :spinResult.players.filter(p=>!drafted.has(`${p.name}|${p.rating}`));
                if(!visible.length)return(
                  <div style={{textAlign:"center",fontFamily:"'Saira Condensed',sans-serif",color:"#f87171",padding:"18px 0",fontSize:"0.82rem"}}>
                    No available players{slotPos?` for ${slotPos}`:""}<br/>
                    <span style={{color:"#64748b",fontSize:"0.72rem"}}>Use a respin to try another nation.</span>
                  </div>
                );
                return visible.map((p,i)=>{
                  const openSlots=draftMode==="spin-first"?slots.filter(s=>!s.player&&compatibleWithSlot(p.pos,s.pos)):[];
                  const canPlace=(draftMode==="position-first")||(openSlots.length>0);
                  const rColor=p.rating>=90?"#f5a623":p.rating>=80?"#6ee7b7":"#93c5fd";
                  return(
                    <button key={i} className="pr" disabled={!canPlace} style={{opacity:canPlace?1:0.18}}
                      onClick={()=>{
                        if(!canPlace)return;
                        if(draftMode==="position-first")assignPlayer(activeIdx,p);
                        else{setSfPick({player:p});setShowModal(false);}
                      }}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Kanit',sans-serif",fontWeight:600,fontSize:"0.95rem",color:canPlace?"#f1f5f9":"#1e293b",letterSpacing:"0.3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                        <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.7rem",color:"#64748b",marginTop:1}}>{p.pos.join(" · ")}{draftMode==="spin-first"&&canPlace&&<span style={{color:"rgba(245,166,35,0.5)",marginLeft:6}}>{openSlots.length} slot{openSlots.length!==1?"s":""}</span>}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                        <div style={{fontFamily:"'Teko',sans-serif",fontSize:"1.6rem",fontWeight:400,color:canPlace?rColor:"#1e293b",lineHeight:1,letterSpacing:"-0.5px"}}>{p.rating}</div>
                        <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.62rem",color:"#64748b",letterSpacing:"1px"}}>OVR</div>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
            <div style={{marginTop:14}}>
              <button onClick={doRespin} disabled={respins<=0&&!!difficulty}
                style={{width:"100%",background:respins>0||!difficulty?"rgba(245,166,35,0.05)":"rgba(255,255,255,0.01)",border:`1px solid ${respins>0||!difficulty?"rgba(245,166,35,0.2)":"rgba(255,255,255,0.04)"}`,color:respins>0||!difficulty?"#f5a623":"#1e293b",fontFamily:"'Teko',sans-serif",padding:"10px",cursor:respins>0||!difficulty?"pointer":"not-allowed",fontSize:"1rem",letterSpacing:"3px",opacity:respins<=0&&difficulty?.25:1,borderRadius:3}}>
                RESPIN ({respins}) ↺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPIN-FIRST SLOT CHOOSER */}
      {sfPick&&(
        <div style={{position:"fixed",inset:0,background:"rgba(4,7,14,0.97)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:14,backdropFilter:"blur(4px)"}}>
          <div style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",maxWidth:340,width:"100%",maxHeight:"84vh",overflowY:"auto",borderRadius:6,padding:18}}>
            <div style={{textAlign:"center",marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="tag" style={{marginBottom:4}}>Assign Player</div>
              <div style={{fontFamily:"'Kanit',sans-serif",fontSize:"1.3rem",fontWeight:600,color:"#f1f5f9"}}>{sfPick.player.name}</div>
              <div style={{fontFamily:"'Saira Condensed',sans-serif",fontSize:"0.72rem",color:"#475569",marginTop:3}}>{sfPick.player.pos.join(" · ")} · <span style={{color:"#f5a623",fontFamily:"'Teko',sans-serif",fontSize:"1rem"}}>{sfPick.player.rating}</span> OVR</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {slots.map((slot,i)=>{
                const ok=compatibleWithSlot(sfPick.player.pos,slot.pos)&&!slot.player;
                return(
                  <button key={i} onClick={()=>ok&&assignPlayer(slot.idx,sfPick.player)}
                    style={{background:ok?"rgba(245,166,35,0.05)":"rgba(255,255,255,0.01)",border:`1px solid ${ok?"rgba(245,166,35,0.2)":"rgba(255,255,255,0.04)"}`,color:ok?"#cbd5e1":"#1e293b",cursor:ok?"pointer":"not-allowed",padding:"8px 12px",display:"flex",alignItems:"center",gap:10,width:"100%",fontFamily:"'Saira Condensed',sans-serif",borderRadius:3,transition:"all .15s"}}>
                    <span style={{background:ok?"rgba(245,166,35,0.1)":"rgba(255,255,255,0.02)",color:ok?"#f5a623":"#1e293b",fontFamily:"'Teko',sans-serif",fontSize:"0.78rem",fontWeight:500,padding:"3px 6px",minWidth:36,textAlign:"center",borderRadius:2,letterSpacing:"1px"}}>{slot.pos}</span>
                    <span style={{fontSize:"0.82rem"}}>{slot.player?<span style={{color:"#334155"}}>{slot.player.name}</span>:ok?<span style={{color:"#64748b"}}>empty</span>:<span style={{color:"#1e293b"}}>incompatible</span>}</span>
                  </button>
                );
              })}
            </div>
            <button className="gb" style={{marginTop:12,width:"100%"}} onClick={()=>{setSfPick(null);setShowModal(true);}}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
