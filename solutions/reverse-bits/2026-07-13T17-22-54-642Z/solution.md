```java
class Solution {
    public int reverseBits(int n) {
        String bit = String.format("%32s", Integer.toBinaryString(n)).replace(' ', '0');

        String result = "";

        System.out.println(bit);

        for (int i = bit.length() - 1; i >= 0 ; i--){
            char ch = bit.charAt(i);
            result += String.valueOf(ch);
        }

        return Integer.parseInt(result, 2);
    }
}
```
