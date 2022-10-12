//求最长递增子序列的个数
function getSequence(arr) {
    const len = arr.length;

    const result = [0]; //默认以第0个为基准来做序列
    let start;
    let end;
    let middle;
    let resultLastIndex;
    for (let i = 0; i < len; i++) {
        let arrI = arr[i];
        if (arrI !== 0) {
            resultLastIndex = result[result.length - 1];
            if (arr[resultLastIndex] < arrI) { //比较最后一项和当前项的大小 大于最后一项就放入数组
                result.push(i);
                continue

            }

            //通过二分查找
            start = 0;
            end = result.length - 1;
            while (start < end) {
                middle = ((start + end) / 2) | 0; //找到中间的值
                if (arr[result[middle]] < arrI) {
                    start = middle + 1;
                }else{
                    end = middle
                }
            }
            //找到中间值 需要做替换操作
            if (arr[result[end]] > arrI) {
                result[end] = i;
            }
        }

    }
    return result;
}