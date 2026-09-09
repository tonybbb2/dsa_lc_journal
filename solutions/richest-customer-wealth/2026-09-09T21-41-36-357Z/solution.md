```java
class Solution {
    public int maximumWealth(int[][] accounts) {
        int max = 0;

        for (int i=0; i < accounts.length; i++) {
            int sumRow = 0;
            for (int j=0; j < accounts[i].length; j++) {
                    sumRow += accounts[i][j]; 
            }
            max = Math.max(max, sumRow);
        }
        return max;
    }
}
```
