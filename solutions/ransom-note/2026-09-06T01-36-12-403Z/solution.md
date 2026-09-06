```java
class Solution {
    public boolean canConstruct(String ransomNote, String magazine) {
        if (magazine.contains(ransomNote)) {
            return true;
        } else {
            return false;
        }
    }
}
```
