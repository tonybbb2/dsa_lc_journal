```java
class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
   
        int[][] dp = new int[triangle.size()][triangle.size()];

        for (int j = 0; j < triangle.size(); j++) {
            dp[triangle.size() - 1][j] = triangle.get(triangle.size() - 1).get(j);
        }

        for (int i=triangle.size()-2; i >= 0; i--) {
            for (int j=0; j < triangle.get(i).size() ;j++) {
                dp[i][j] = triangle.get(i).get(j) + Math.min(dp[i+1][j], dp[i+1][j+1]);
            }
        }

        return dp[0][0];
    }
}
```
