import { TRUE, FALSE, AND, OR, NOT, toBool } from './church.js';
import { IS_ZERO, ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, ADD, MUL, POW, SUB, SUCC, PRED, DOUBLE, SQUARE, toInt } from './church.js';
import { LEQ, LT, GT, EQUALS, PAIR, FIRST, SECOND, IF, Y } from './church.js';
import { LIST_NODE, LIST_EQ, NIL, SUMLIST, MAP, HEAD, TAIL, APPEND, toArray, toChurchString, fromChurchString } from './church.js';
import { EMPTY_OBJ, GET, SET, SEND } from './church.js';
import { LET, WHILE, FOR } from './church.js';

// --- boolean examples
console.log( 'true:', toBool( TRUE ) );
console.log( 'false:', toBool( FALSE ) );

console.log( 'true & true:', toBool( AND(TRUE)(TRUE) ) );
console.log( 'false & true:', toBool( AND(FALSE)(TRUE) ) );
console.log( 'true & false:', toBool( AND(TRUE)(FALSE) ) );
console.log( 'false & false:', toBool( AND(FALSE)(FALSE) ) );

console.log( 'true | true:', toBool( OR(TRUE)(TRUE) ) );
console.log( 'false | true:', toBool( OR(FALSE)(TRUE) ) );
console.log( 'true | false:', toBool( OR(TRUE)(FALSE) ) );
console.log( 'false | false:', toBool( OR(FALSE)(FALSE) ) );

console.log( '!true:', toBool( NOT(TRUE) ) );
console.log( '!false:', toBool( NOT(FALSE) ) );

// --- number examples 

console.log( toInt( ZERO ) );
console.log( toInt( ONE ) );
console.log( toInt( TWO ) );
console.log( toInt( THREE ) );

console.log( '4++:', toInt( SUCC( FOUR ) ) );
console.log( '5--:', toInt( PRED(FIVE ) ) );

console.log( '6+7:', toInt( ADD(SIX)(SEVEN) ) );
console.log( '7-6:', toInt( SUB(SEVEN)(SIX) ) );
console.log( '8*9:', toInt( MUL(EIGHT)(NINE) ) );
console.log( '10^2:', toInt( POW(TEN)(TWO) ) );

console.log( '2<=4:', toBool( LEQ(TWO)(FOUR)) ); // true
console.log( '4<=2:', toBool( LEQ(FOUR)(TWO)) ); // false
console.log( '2<=2:', toBool( LEQ(TWO)(TWO)) );  // true
console.log( '2<4:', toBool( LT(TWO)(FOUR)));   // true
console.log( '4<2:', toBool( LT(FOUR)(TWO)) );  // false

// --- functions

const FAC = Y(self => n =>
  IF (EQUALS(n)(ONE))               // if n == 1
    (() => ONE)                     //    return 1
    (() => MUL(n)(self(PRED(n))))); //    else return n * fac(n-1)

console.log( 'FAC(5):', toInt( FAC(FIVE) ) );    

// --- lists

const list = LIST_NODE(THREE)(LIST_NODE(TWO)(LIST_NODE(ONE)(NIL))); // This is [3, 2, 1]

console.log( '[3,2,1]', toArray( list, toInt ) );
console.log( 'SUM([3,2,1]:'), toInt( SUMLIST(list) );
console.log( 'MAP(x => x+x, [3,2,1]:', toArray( MAP(DOUBLE)(list), toInt ) );
console.log( 'SUM(MAP...):', toInt( SUMLIST(MAP(DOUBLE)(list) ) ) );

console.log( 'HEAD([3,2,1]:', toInt( HEAD( list ) ) );
console.log( 'TAIL([3,2,1]:', toArray( TAIL( list ), toInt ) );

// --- strings

const str1 = toChurchString("Hello ");
const str2 = toChurchString("world");

console.log( '"Hello "+"world":', fromChurchString( APPEND(str1)(str2) ) );

console.log( '"foo"=="foo":', toBool(LIST_EQ(toChurchString('foo'))(toChurchString('foo')) ) ); // true
console.log( '"foo"=="bar":', toBool(LIST_EQ(toChurchString('foo'))(toChurchString('bar')) ) ); // false

// --- objects

const NAME   = ONE;
const AGE    = TWO;
const CITY   = THREE;
const DOGAGE = FOUR;

// Create the "Object": { AGE: 3, NAME: 1 }
const user = SET(SET(EMPTY_OBJ)(NAME)(ONE))(AGE)(THREE);

// To "get" a value, you just call the object with the key!
console.log( 'GET NAME property from an object:', toInt( GET(user)(NAME) ) ); 
console.log( 'GET AGE property from an object:', toInt( GET(user)(AGE) ) ); 

// A Method that calculates 'Age in Dog Years'
// It expects 'self' so it can look up 'AGE'
// like: (this) => this.age * 7
const get_dog_age_function = self => MUL(self(AGE))(SEVEN);

const user2 = SET(SET(EMPTY_OBJ)(DOGAGE)(get_dog_age_function))(AGE)(THREE);

// we "SEND" the DOGAGE message (field name) to the object
// this calls the function, passing the object as "self" to it!
const result = SEND(user2)(DOGAGE);

console.log("Call a method that uses 'this/self' on an object. Age in dog Years:", toInt(result)); // 21 (3 * 7)

// --- let

console.log( 
  'let x=4; let y=7; return x+y',
  toInt( 
    LET(FOUR)(x => 
      LET(SEVEN)(y => 
        ADD(x)(y)
      )
    ) ) );

// --- while

const SUM_0TON = n => 
  SECOND( // return accumulator from (index, accumulator)
    WHILE
      (pair => NOT(IS_ZERO(FIRST(pair)))) // while index != 0
      (pair =>                            // take (index, accumulator)
        LET(FIRST(pair))(i =>             // i = index
          LET(SECOND(pair))(a =>          // a = accumulator
            PAIR(PRED(i))(ADD(i)(a))))    // return (i-1, a+i)
      )
      (PAIR(n)(ZERO)) // initial state: (index, accumulator) = (n,0)
  );
console.log( '0+1+...+5 using WHILE:', toInt( SUM_0TON(FIVE) ) ); // 15

// acc = 0
// for i=1; i<n; i++
//   acc = acc * i
const MUL_1TON = n => FOR(ONE)(i => LEQ(i)(n))(SUCC)(ONE)(acc => i => MUL(acc)(i));

console.log( '1*2*3*4*5 using FOR:', toInt( MUL_1TON(FIVE)) ); // 120