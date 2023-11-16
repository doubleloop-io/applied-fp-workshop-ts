describe("model data - algebraic data types", () => {
  // In FP types are used to model/describe data and behavior intent.
  //   - Algebraic Data Type (ADT) to model data
  //   - Functions to model behaviors

  // Single Type Modelling

  // Proper types
  // es: Int, String

  // Type alias - rename a type without change it
  type Name = string

  // Type wrapper - rename a type and change it
  type Age = Readonly<{ value: number }>
  // type Age = { readonly value: number }

  // value constructor
  const age = (value: number): Age => ({ value })

  // alternative implementation with class
  // class Age {
  //   constructor(readonly value: number) {}
  // }

  it("type wrapper - values equality", () => {
    const value = age(12)
    // alternative creation with class
    // const value = new Age(12)
    expect(value).toStrictEqual(value)

    const same = age(12)
    expect(value).toStrictEqual(same)

    const different = age(20)
    expect(value).not.toStrictEqual(different)
  })

  // Composed Types

  // Product types - put many types together e.g. struct in C, POJO in JAVA, POCO in C#.
  // Useful to model independent data in AND e.g. a Person is composed by a name *and* an age.

  type Person = Readonly<{ name: string; age: number }>
  // type Person = { readonly name: string; readonly age: number }
  const person = (name: string, age: number): Person => ({ name, age })

  it("product type - values equality", () => {
    const value = person("john", 12)
    expect(value).toStrictEqual(value)

    const same = person("john", 12)
    expect(value).toStrictEqual(same)

    const different = person("mario", 12)
    expect(value).not.toStrictEqual(different)
  })

  // Sum types - model exclusive types e.g. union in C, enum in JAVA/C#.
  // Useful to model dependant data in OR e.g. the Light is on *or* off.

  type LightState = On | Off
  type On = Readonly<{ _tag: "On"; intensity: number }>
  type Off = Readonly<{ _tag: "Off" }>

  const on = (intensity: number): LightState => ({ _tag: "On", intensity })
  const off = (): LightState => ({ _tag: "Off" })

  it("sum type - values equality", () => {
    const value: LightState = on(10)
    expect(value).toStrictEqual(value)

    const same: LightState = on(10)
    expect(value).toStrictEqual(same)

    const different: LightState = off()
    expect(value).not.toStrictEqual(different)
  })

  // Polymorphic Types
  // Types with generics (Triple) are called: type constructor
  // While the generics labels (A, B, C) are called: type parameters
  type Triple<A, B, C> = Readonly<{ a: A; b: B; c: C }>

  const triple = <A, B, C>(a: A, b: B, c: C): Triple<A, B, C> => ({ a, b, c })
})
