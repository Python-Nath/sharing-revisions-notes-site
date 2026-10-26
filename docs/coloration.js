/* Coloration locale. Aucun script externe, le texte du code n'est jamais interprété comme du HTML. */

var MOTS_PYTHON = {
  False: 1, None: 1, True: 1, and: 1, as: 1, assert: 1, async: 1, await: 1,
  break: 1, class: 1, continue: 1, def: 1, elif: 1, else: 1, except: 1,
  finally: 1, for: 1, from: 1, global: 1, if: 1, import: 1, in: 1, is: 1,
  lambda: 1, nonlocal: 1, not: 1, or: 1, pass: 1, raise: 1, return: 1,
  try: 1, while: 1, with: 1, yield: 1
};

var MOTS_JS = {
  break: 1, case: 1, catch: 1, class: 1, const: 1, continue: 1, debugger: 1,
  default: 1, delete: 1, do: 1, else: 1, export: 1, extends: 1, false: 1,
  finally: 1, for: 1, function: 1, if: 1, import: 1, in: 1, instanceof: 1,
  let: 1, new: 1, null: 1, return: 1, super: 1, switch: 1, this: 1, throw: 1,
  true: 1, try: 1, typeof: 1, undefined: 1, var: 1, void: 1, while: 1, with: 1,
  of: 1
};

var CONTROLE = {
  if: 1, else: 1, elif: 1, for: 1, while: 1, return: 1, try: 1, except: 1,
  finally: 1, with: 1, raise: 1, yield: 1, break: 1, continue: 1, pass: 1,
  assert: 1, lambda: 1, async: 1, await: 1, import: 1, from: 1, as: 1,
  in: 1, is: 1, and: 1, or: 1, not: 1, case: 1, catch: 1, do: 1, switch: 1,
  throw: 1, typeof: 1, instanceof: 1, of: 1, new: 1, delete: 1
};

var LANGAGE = {
  True: 1, False: 1, None: 1, true: 1, false: 1, null: 1, undefined: 1,
  self: 1, cls: 1, this: 1
};

function affiner(tokens) {
  var precedent = "";
  tokens.forEach(function (morceau) {
    if (morceau.type === "mot" && CONTROLE[morceau.text]) morceau.type = "ctrl";
    if (LANGAGE[morceau.text] && (morceau.type === "mot" || morceau.type === "nom" || morceau.type === "fn")) {
      morceau.type = "lang";
    }
    if ((morceau.type === "nom" || morceau.type === "fn") && precedent === "class") {
      morceau.type = "cls";
    } else if (morceau.type === "nom" && (precedent === "def" || precedent === "function")) {
      morceau.type = "fn";
    } else if (morceau.type === "nom") {
      morceau.type = "var";
    }
    if (morceau.text.trim() && morceau.type !== "com") precedent = morceau.text;
  });
  return tokens;
}

function jeton(type, text) {
  return { type: type, text: text };
}

function tokeniserProgramme(source, mots) {
  var sortie = [];
  var i = 0;
  while (i < source.length) {
    var c = source[i];
    var suivant = source[i + 1];
    if (c === "#" && mots === MOTS_PYTHON) {
      var fin = source.indexOf("\n", i);
      if (fin === -1) fin = source.length;
      sortie.push(jeton("com", source.slice(i, fin)));
      i = fin;
      continue;
    }
    if (c === "/" && suivant === "/" && mots === MOTS_JS) {
      var finL = source.indexOf("\n", i);
      if (finL === -1) finL = source.length;
      sortie.push(jeton("com", source.slice(i, finL)));
      i = finL;
      continue;
    }
    if (c === "/" && suivant === "*" && mots === MOTS_JS) {
      var finB = source.indexOf("*/", i + 2);
      finB = finB === -1 ? source.length : finB + 2;
      sortie.push(jeton("com", source.slice(i, finB)));
      i = finB;
      continue;
    }
    if (c === "'" || c === '"' || (c === "`" && mots === MOTS_JS)) {
      var quote = c;
      var j = i + 1;
      if ((source.slice(i, i + 3) === "'''" || source.slice(i, i + 3) === '"""') && mots === MOTS_PYTHON) {
        quote = source.slice(i, i + 3);
        j = i + 3;
      }
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source.slice(j, j + quote.length) === quote) {
          j += quote.length;
          break;
        }
        j += 1;
      }
      sortie.push(jeton("str", source.slice(i, j)));
      i = j;
      continue;
    }
    if (c >= "0" && c <= "9") {
      var k = i + 1;
      while (k < source.length && /[0-9.xXa-fA-F_]/.test(source[k])) k += 1;
      sortie.push(jeton("num", source.slice(i, k)));
      i = k;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      var n = i + 1;
      while (n < source.length && /[A-Za-z0-9_]/.test(source[n])) n += 1;
      var mot = source.slice(i, n);
      var type = mots[mot] ? "mot" : "nom";
      if (type === "nom" && source[n] === "(") type = "fn";
      sortie.push(jeton(type, mot));
      i = n;
      continue;
    }
    sortie.push(jeton("", c));
    i += 1;
  }
  return affiner(sortie);
}

function tokeniserHtml(source) {
  var sortie = [];
  var i = 0;
  while (i < source.length) {
    if (source.slice(i, i + 4) === "<!--") {
      var fin = source.indexOf("-->", i + 4);
      fin = fin === -1 ? source.length : fin + 3;
      sortie.push(jeton("com", source.slice(i, fin)));
      i = fin;
      continue;
    }
    if (source[i] === "<") {
      var j = i + 1;
      while (j < source.length && source[j] !== ">") {
        if (source[j] === '"' || source[j] === "'") {
          var q = source[j];
          j += 1;
          while (j < source.length && source[j] !== q) {
            if (source[j] === "\\") j += 1;
            j += 1;
          }
        }
        j += 1;
      }
      if (j < source.length) j += 1;
      var balise = source.slice(i, j);
      var nom = balise.match(/^<\/?\s*([A-Za-z0-9:-]+)/);
      sortie.push(jeton("ponc", balise[0]));
      var reste = balise.slice(1, balise.endsWith(">") ? -1 : undefined);
      if (nom) {
        var debutNom = reste.indexOf(nom[1]);
        sortie.push(jeton("", reste.slice(0, debutNom)));
        sortie.push(jeton("balise", nom[1]));
        reste = reste.slice(debutNom + nom[1].length);
      }
      colorierAttributs(reste, sortie);
      if (balise.endsWith(">")) sortie.push(jeton("ponc", ">"));
      i = j;
      continue;
    }
    var prochain = source.indexOf("<", i);
    if (prochain === -1) prochain = source.length;
    sortie.push(jeton("", source.slice(i, prochain)));
    i = prochain;
  }
  return sortie;
}

function colorierAttributs(texte, sortie) {
  var i = 0;
  while (i < texte.length) {
    var c = texte[i];
    if (c === '"' || c === "'") {
      var j = i + 1;
      while (j < texte.length && texte[j] !== c) j += 1;
      if (j < texte.length) j += 1;
      sortie.push(jeton("str", texte.slice(i, j)));
      i = j;
      continue;
    }
    if (/[A-Za-z_:-]/.test(c)) {
      var n = i + 1;
      while (n < texte.length && /[A-Za-z0-9_:-]/.test(texte[n])) n += 1;
      sortie.push(jeton("attr", texte.slice(i, n)));
      i = n;
      continue;
    }
    sortie.push(jeton("", c));
    i += 1;
  }
}

function tokeniserCss(source) {
  var sortie = [];
  var i = 0;
  var dansBloc = 0;
  while (i < source.length) {
    if (source.slice(i, i + 2) === "/*") {
      var fin = source.indexOf("*/", i + 2);
      fin = fin === -1 ? source.length : fin + 2;
      sortie.push(jeton("com", source.slice(i, fin)));
      i = fin;
      continue;
    }
    var c = source[i];
    if (c === '"' || c === "'") {
      var j = i + 1;
      while (j < source.length && source[j] !== c) {
        if (source[j] === "\\") j += 1;
        j += 1;
      }
      if (j < source.length) j += 1;
      sortie.push(jeton("str", source.slice(i, j)));
      i = j;
      continue;
    }
    if (c === "{") {
      dansBloc += 1;
      sortie.push(jeton("", c));
      i += 1;
      continue;
    }
    if (c === "}") {
      dansBloc = Math.max(0, dansBloc - 1);
      sortie.push(jeton("", c));
      i += 1;
      continue;
    }
    if (dansBloc && /[A-Za-z_-]/.test(c)) {
      var n = i + 1;
      while (n < source.length && /[A-Za-z0-9_-]/.test(source[n])) n += 1;
      var mot = source.slice(i, n);
      var apres = source.slice(n).match(/^\s*:/);
      sortie.push(jeton(apres ? "prop" : "nom", mot));
      i = n;
      continue;
    }
    if (!dansBloc && c !== "\n" && c !== " " && c !== "\t") {
      var s = i + 1;
      while (s < source.length && source[s] !== "{" && source[s] !== "}") s += 1;
      sortie.push(jeton("sel", source.slice(i, s)));
      i = s;
      continue;
    }
    sortie.push(jeton("", c));
    i += 1;
  }
  return sortie;
}

function tokeniser(source, langage) {
  if (langage === "html") return tokeniserHtml(source);
  if (langage === "css") return tokeniserCss(source);
  if (langage === "javascript") return tokeniserProgramme(source, MOTS_JS);
  return tokeniserProgramme(source, MOTS_PYTHON);
}

function colorier(source, langage) {
  var pre = document.createElement("pre");
  pre.className = "code lang-" + (langage || "python");
  var code = document.createElement("code");
  tokeniser(source || "", langage).forEach(function (morceau) {
    var span = document.createElement("span");
    if (morceau.type) span.className = "tok-" + morceau.type;
    span.textContent = morceau.text;
    code.append(span);
  });
  pre.append(code);
  return pre;
}
