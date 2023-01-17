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
  type Age = { value: number }
  const ageCtor = (value: number): Age => ({ value })
  // alternative implementation with native class
  // class Age {
  //   constructor(readonly value: number) {}
  // }

  it("type wrapper - values equality", () => {
    const age = ageCtor(12)
    // const age = new Age(12)
    expect(age).toStrictEqual(age)

    const same = ageCtor(12)
    // const same = new Age(12)
    expect(age).toStrictEqual(same)

    const different = ageCtor(20)
    // const different = new Age(20)
    expect(age).not.toStrictEqual(different)
  })

  // Composed Types Modelling

  // Product types - put many types together. e.g. struct in C, POJO in JAVA, POCO in C#.
  // Useful to model independent data in AND e.g. a Person is composed by a name *and* an age.
  type Person = { readonly name: string; readonly age: number }
  const personCtor = (name: string, age: number): Person => ({ name, age })

  it("product type - values equality", () => {
    const person = personCtor("john", 12)
    expect(person).toStrictEqual(person)

    const same = personCtor("john", 12)
    expect(person).toStrictEqual(same)

    const different = personCtor("mario", 12)
    expect(person).not.toStrictEqual(different)
  })

  // Sum types - model exclusive types e.g. union in C, enum in JAVA/C#.
  // Useful to model dependant data in OR e.g. the Light is on *or* off.
  type LightState = On | Off
  type On = { readonly _tag: "On"; readonly intensity: number }
  type Off = { readonly _tag: "Off" }
  const onCtor = (intensity: number): LightState => ({ _tag: "On", intensity })
  const offCtor = (): LightState => ({ _tag: "Off" })

  it("sum type - values equality", () => {
    const light: LightState = onCtor(10)
    expect(light).toStrictEqual(light)

    const same: LightState = onCtor(10)
    expect(light).toStrictEqual(same)

    const different: LightState = offCtor()
    expect(light).not.toStrictEqual(different)
  })

  // Polymorphic Types
  // Types with generics (Triple) are called: type constructor
  // While the generics (A, B, C) are called: type parameters
  type Triple<A, B, C> = { readonly a: A; readonly b: B; readonly c: C }
})
