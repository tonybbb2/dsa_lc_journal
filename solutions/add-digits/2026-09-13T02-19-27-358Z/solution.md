```java
class Solution {
    public int addDigits(int num) {
        int sum = 0;
        int myNumber = String.valueOf(num).length();
        String str = Integer.toString(myNumber);

        if (num < 10) {
            return num;
        }

        for (int i=0; i < str.length(); i++) {
            char ch = str.charAt(i);
            sum += ch - '0';
        }

        return addDigits(sum);
    }
}
```
