---
title: Investigating the Countdown Timer
createdAt: Feb 13, 2022
updatedAt: Feb 13, 2022
---

When I originally built the countdown timer component, I didn't know enough about the intrices of `useEffect` which led to some not-so-performant<sup>1</sup> code. Below is the old, not good code to which I've added some log statements to see what is going on.

```jsx
// NOT GOOD
useEffect(() => {
  const intervalId = setInterval(() => {
    console.log(`Tick: ${intervalId}`);
    setTimeLeft(timeLeft - 1);
  }, 1000);
  console.log(`New Interval: ${intervalId}`);

  return () => {
    console.log(`Clear Interval: ${intervalId}`);
    clearInterval(intervalId);
  };
}, [timeLeft]);
```

The output of the above code is this:

```
New Interval: 101
Tick: 101
Clear Interval: 101
New Interval: 102
Tick: 102
Clear Interval: 102
New Interval: 103
Tick: 103
Clear Interval: 103
New Interval: 104
Tick: 104
Clear Interval: 104
New Interval: 105
Tick: 105
Clear Interval: 105
New Interval: 106
Tick: 106
Clear Interval: 106
New Interval: 107
Tick: 107
Clear Interval: 107
```

Clearly, this was not what I had in mind. While it works, something seems wrong. The `useEffect` hook itself is executing every second.

Instead of using the value returned by `useState`, use only the `setState` function returned by `useState` and access the existing/previous value by passing an updater function instead of a value.

```jsx
// BETTER
useEffect(() => {
  const intervalId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
  return () => clearInterval(intervalId);
}, [setTimeLeft]);
```

A much better looking output:

```
New Interval: 74
Tick: 74
Tick: 74
Tick: 74
Tick: 74
Tick: 74
Tick: 74
Tick: 74
Clear Interval: 74
```

<sup>1</sup> I haven't done any actual performance comparisons between the two but _based on my gut feeling_, I believe the second code snippet is better.
