<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框区域 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 选择button -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="90px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="90px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
    <!-- 编辑分页区域 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 主体区域 -->
      <!--  :rules="editFormRules" -->
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="商品名称">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsInfo">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //商品列表
      goodslist: [],
      //总数据
      total: 0,
      editForm: {},
      editDialogVisible: false,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      //this.$message.success("获取商品列表成功!");
      this.goodslist = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败!");
      }
      this.$message.success("删除商品成功");
      this.getGoodsList();
    },
    goAddpage() {
      this.$router.push("/goods/add");
    },
    //商品编辑
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询商品失败!");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClose(){
       this.$refs.editFormRef.clearValidate();
    },
    editGoodsInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        //通过  发起修改分类信息请求
        const { data: res } = await this.$http.put(
         "goods/" + this.editForm.goods_id,
          {
            goods_name: this.editForm.goods_name,
            goods_price: this.editForm.goods_price,
            goods_number: this.editForm.goods_number,
            goods_weight: this.editForm.goods_weight,
            goods_introduce: this.editForm.goods_introduce,
            pics:this.editForm.pics,
            attrs:this.editForm.attrs,
          }
        );
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("更新商品失败!");
        }
        //关闭对话框
        this.editDialogVisible = false;
        //刷新数据列表
        this.getGoodsList();
        //提示修改成功
        this.$message.success("更新商品成功!");
      });
    },
    
  },
};
</script>

<style lang="less" scoped></style>
