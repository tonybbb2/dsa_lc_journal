```java
/**
 * @param {number[]} nums
 * @return {number}
 */
var missingNumber = function(nums) {
    const n = nums.length;
    const expectedSum = n * (n + 1) / 2;
    let sumOfArray = 0;

    for (let i = 0; i < nums.length; i++) {
       sumOfArray = sumOfArray + nums[i];
    }

    const number = expectedSum - sumOfArray;

    return number;
};

```
