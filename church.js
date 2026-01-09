// --- booleans
export const TRUE  = a => b => a;
export const FALSE = a => b => b;

export const AND = p => q => p(q)(p);
export const OR  = p => q => p(p)(q);
export const NOT = p => p(FALSE)(TRUE);

export const toBool = f => f(true)(false);

// --- tuples
export const PAIR   = x => y => f => f(x)(y);
export const FIRST  = p => p(TRUE);
export const SECOND = p => p(FALSE);

// --- numbers
export const ZERO  = f => x => x;
export const ONE   = f => x => f(x);
export const TWO   = f => x => f(f(x));
export const THREE = f => x => f(f(f(x)));
export const FOUR  = f => x => f(f(f(f(x))));
export const FIVE  = f => x => f(f(f(f(f(x)))));

export const SUCC   = n => f => x => f(n(f)(x));

export const SIX   = SUCC(FIVE);
export const SEVEN = SUCC(SIX);
export const EIGHT = SUCC(SEVEN);
export const NINE  = SUCC(EIGHT);
export const TEN   = SUCC(NINE);

export const toInt = n => n(i => i + 1)(0);

export const ADD   = m => n => f => x => m(f)(n(f)(x));
export const MUL   = m => n => f => m(n(f));
export const POW = m => n => f => n(m)(f);

export const DOUBLE = n => ADD(n)(n);
export const SQUARE = n => MUL(n)(n);

export const IS_ZERO = n => n(x => FALSE)(TRUE);

export const EQUALS = m => n => 
  AND (IS_ZERO(SUB(m)(n))) 
      (IS_ZERO(SUB(n)(m)));

export const LEQ = m => n => IS_ZERO(SUB(m)(n));  // no negative numbers, subtracting from ZERO stays at ZERO!
export const GT  = m => n => NOT(LEQ(m)(n));
export const LT  = m => n => NOT(LEQ(n)(m));

// A helper that takes a pair (n, m) and returns (m, m+1)
const PHI = p => PAIR(SECOND(p))(SUCC(SECOND(p)));
// PRED starts at (0, 0), applies PHI 'n' times, then takes the FIRST element (clever!)
export const PRED = n => FIRST(n(PHI)(PAIR(ZERO)(ZERO)));
// SUBTRACT(m)(n) is just applying PRED to m, n times.
export const SUB = m => n => n(PRED)(m);

// --- if
export const IF = p => a => b => p(a)(b)();

// --- recursion
export const Y = f => (x => x(x))(x => f(y => x(x)(y)));

// --- lists
export const NIL    = PAIR(TRUE)(TRUE); 
export const IS_NIL = l => FIRST(l); // Returns TRUE if it's NIL, FALSE if it's a real PAIR

// Re-defining PAIR for numbers to ensure FIRST(l) is always FALSE
export const LIST_NODE = x => y => PAIR(FALSE)(PAIR(x)(y));
export const HEAD = l => FIRST(SECOND(l));
export const TAIL = l => SECOND(SECOND(l));

export const toArray = (list, elementConverter = (x => x)) => {
  const result = [];
  let current = list;

  // While IS_NIL is FALSE (using toInt to bridge the Church Boolean to JS)
  while (toInt(IS_NIL(current)) === 0) {
    // 1. Get the data from the current node
    const churchValue = HEAD(current);
    
    // 2. Convert and push to our JS array
    result.push(elementConverter(churchValue));
    
    // 3. Move to the next node
    current = TAIL(current);
  }
  
  return result;
};

// --- sum list
export const SUMLIST = Y(self => list => 
  IF (IS_NIL(list))
    (() => ZERO) 
    (() => ADD(HEAD(list))(self(TAIL(list)))));

// --- map
export const MAP = Y(self => f => list =>
  IF (IS_NIL(list))
    (() => NIL)
    (() => LIST_NODE(f(HEAD(list)))(self(f)(TAIL(list)))));

export const APPEND = Y(self => list1 => list2 =>
  IF (IS_NIL(list1))
    (() => list2)
    (() => LIST_NODE(HEAD(list1))(self(TAIL(list1))(list2))));

export const LIST_EQ = Y(self => l1 => l2 =>
  IF (IS_NIL(l1))
    // If l1 is empty, they are equal only if l2 is also empty
    (() => IS_NIL(l2))
    // If l1 is not empty...
    (() => IF (IS_NIL(l2))
      // ...but l2 is empty, they are not equal
      (() => FALSE)
      // Both are non-empty: Compare heads and recurse on tails
      (() => AND 
        (EQUALS(HEAD(l1))(HEAD(l2))) // Heads must match
        (self(TAIL(l1))(TAIL(l2))) // Tails must match
      )
    ));

// --- strings

// convert JS string to Church list of characters
export const toChurchString = (str) => {
  return str.split('').reverse().reduce((acc, char) => {
    // Convert char to its code, then to a Church Numeral
    const code = char.charCodeAt(0);
    const churchNum = (f => x => {
      let res = x;
      for(let i=0; i<code; i++) res = f(res);
      return res;
    });
    return LIST_NODE(churchNum)(acc);
  }, NIL);
};

// convert Church list back to JS string
export const fromChurchString = (cStr) => {
  let result = "";
  let current = cStr;
  
  while(toInt(IS_NIL(current)) === 0) { 
    const charCode = toInt(HEAD(current));
    result += String.fromCharCode(charCode);
    current = TAIL(current);
  }
  return result;
};

// --- objects
export const EMPTY_OBJ = k => FALSE;

// To add a property, we wrap the old object in a new function
export const SET = obj => key => value => 
  requestedKey => 
    IF (EQUALS(requestedKey)(key))
      (() => value)
      (() => obj(requestedKey));

export const GET = obj => key => obj(key);

export const SEND = obj => key => obj(key)(obj);

// --- variables
export const LET = v => f => f(v);

// --- loops
export const WHILE = Y(self => condition => transform => state =>
  IF (condition(state))
    // if true: execute the transformation and recursively call in new state
    (() => self(condition)(transform)(transform(state)))
    // if false: return state
    (() => state)
);

export const FOR = init_i => cond => step => init_acc => body => 
  SECOND(
    WHILE
      (pair => cond(FIRST(pair)))
      (pair => 
        LET(FIRST(pair))(index =>
          LET(SECOND(pair))(acc =>
          PAIR(step(index))(body(acc)(index))
          )
        )
      )
      (PAIR(init_i)(init_acc))
  );