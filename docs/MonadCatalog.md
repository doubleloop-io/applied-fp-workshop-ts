# Monad Catalog

```
Option[A]        // Computations which may not return a result

Either[A, B]      // Computations which can complete with two possibile values

IO[A]             // Synchronous computations which perform I/O operations and never fails

Task[A]           // Asynchronous computations which produce a value at some point and never fails

TaskEither[E, A]  // Asynchronous computations which produce a value at some point or fails
```
